import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditContent } from './audit-content.mjs'
import { PROJECT_ROOT, contentTriplets, normalizeWindow, parseMeta, scanForbiddenText, sha256, validateSourceRecord } from './audit-helpers.mjs'
import { auditSources } from './audit-source-links.mjs'
import { auditStaticLinks } from './audit-static-links.mjs'

const LEDGER_KEY_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+$/
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const SOURCE_MAP_PATH = path.join(PROJECT_ROOT, 'public', 'source-map.json')

function readLedger(projectRoot) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, 'public', 'source-map.json'), 'utf8'))
}

function sourceTypesByKey(projectRoot) {
  const types = new Map()
  for (const triplet of contentTriplets(projectRoot)) {
    const pageId = parseMeta(triplet.metaPath).id
    const records = JSON.parse(fs.readFileSync(triplet.sourcesPath, 'utf8'))
    for (const record of records) types.set(`${pageId}/${record.id}`, record.type)
  }
  return types
}

function expectCompleteAuditContract(result, projectRoot) {
  expect(result.errors).toEqual([])
  expect(result).toMatchObject({ records: 344, bbSources: 322, verified: 0, localOnly: 344 })

  const entries = Object.entries(result.ledger)
  const keys = entries.map(([key]) => key)
  const sourceTypes = sourceTypesByKey(projectRoot)
  const bbEntries = entries.filter(([key]) => sourceTypes.get(key) === 'bb-source')
  const nonBbEntries = entries.filter(([key]) => sourceTypes.get(key) !== 'bb-source')

  expect(keys).toHaveLength(344)
  expect(keys.every((key) => LEDGER_KEY_PATTERN.test(key))).toBe(true)
  expect(keys).toEqual([...keys].sort((left, right) => left.localeCompare(right)))
  expect(bbEntries).toHaveLength(322)
  expect(bbEntries.every(([, row]) => SHA256_PATTERN.test(row.windowSha256))).toBe(true)
  expect(nonBbEntries).toHaveLength(22)
  expect(nonBbEntries.every(([, row]) => row.windowSha256 === null)).toBe(true)
  expect(entries.every(([, row]) => row.status === 'local-only')).toBe(true)
  expect(entries.every(([, row]) => row.publicUrl === null && row.verifiedAt === null)).toBe(true)

  if (result.sourceRootAvailable) {
    expect(result.sourceRootAvailable).toBe(true)
    expect(result.replayedHashes).toBe(0)
  } else {
    expect(result.sourceRootAvailable).toBe(false)
    expect(result.replayedHashes).toBe(322)
    expect(result.ledger).toEqual(readLedger(projectRoot))
  }
}

function restoreEnvironment(name, existed, value) {
  if (existed) process.env[name] = value
  else delete process.env[name]
}

async function auditPortableFixture(mutateLedger) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'learning-bb-source-audit-'))
  const projectRoot = path.join(temporaryRoot, 'learning-bb')
  const maskedHome = path.join(temporaryRoot, 'masked-home')
  const missingEnvironmentRoot = path.join(temporaryRoot, 'missing-environment-source')
  const missingExplicitRoot = path.join(temporaryRoot, 'missing-explicit-source')
  const homeExisted = Object.hasOwn(process.env, 'HOME')
  const sourceRootExisted = Object.hasOwn(process.env, 'LEARNING_BB_SOURCE_ROOT')
  const priorHome = process.env.HOME
  const priorSourceRoot = process.env.LEARNING_BB_SOURCE_ROOT

  try {
    fs.mkdirSync(path.join(projectRoot, 'src'), { recursive: true })
    fs.cpSync(path.join(PROJECT_ROOT, 'src', 'content'), path.join(projectRoot, 'src', 'content'), { recursive: true })
    fs.mkdirSync(path.join(projectRoot, 'public'), { recursive: true })
    fs.copyFileSync(SOURCE_MAP_PATH, path.join(projectRoot, 'public', 'source-map.json'))
    fs.mkdirSync(maskedHome, { recursive: true })
    if (fs.existsSync(path.join(temporaryRoot, 'kira-agent'))) throw new Error('portable fixture unexpectedly has a sibling BB checkout')

    if (mutateLedger) {
      const fixtureLedgerPath = path.join(projectRoot, 'public', 'source-map.json')
      const mutatedLedger = mutateLedger(readLedger(projectRoot))
      fs.writeFileSync(fixtureLedgerPath, `${JSON.stringify(mutatedLedger, null, 2)}\n`, 'utf8')
    }

    process.env.HOME = maskedHome
    process.env.LEARNING_BB_SOURCE_ROOT = missingEnvironmentRoot
    return await auditSources({ projectRoot, sourceRoot: missingExplicitRoot, write: false })
  } finally {
    restoreEnvironment('HOME', homeExisted, priorHome)
    restoreEnvironment('LEARNING_BB_SOURCE_ROOT', sourceRootExisted, priorSourceRoot)
    fs.rmSync(temporaryRoot, { recursive: true, force: true })
  }
}

function firstReplayableKey(ledger) {
  const key = Object.keys(ledger).find((candidate) => SHA256_PATTERN.test(ledger[candidate].windowSha256 ?? ''))
  if (!key) throw new Error('fixture ledger has no replayable BB row')
  return key
}

const tamperCases = [
  {
    name: 'a missing committed BB key',
    mutate(ledger) {
      delete ledger[firstReplayableKey(ledger)]
      return ledger
    },
    error: /committed source-map row lacks a replayable SHA-256/,
  },
  {
    name: 'an extra committed ledger key',
    mutate(ledger) {
      ledger['zz-extra-page/extra-source'] = { status: 'local-only', publicUrl: null, verifiedAt: null, windowSha256: null }
      return ledger
    },
    error: /committed source-map projection is not deterministic/,
  },
  {
    name: 'a non-SHA BB window value',
    mutate(ledger) {
      ledger[firstReplayableKey(ledger)].windowSha256 = 'not-a-sha-256'
      return ledger
    },
    error: /committed source-map row lacks a replayable SHA-256/,
  },
  {
    name: 'changed committed key ordering',
    mutate(ledger) {
      const entries = Object.entries(ledger)
      const first = entries[0]
      entries[0] = entries[1]
      entries[1] = first
      return Object.fromEntries(entries)
    },
    error: /committed source-map projection is not deterministic/,
  },
  {
    name: 'fabricated verified public state',
    mutate(ledger) {
      const key = firstReplayableKey(ledger)
      ledger[key] = { ...ledger[key], status: 'verified', publicUrl: 'https://example.invalid/source', verifiedAt: '2026-08-15' }
      return ledger
    },
    error: /committed source-map projection is not deterministic|public/,
  },
]

describe('I01 fail-closed integration audits', () => {
  it('accepts the exact authored inventory and page budgets', () => {
    const result = auditContent(PROJECT_ROOT)
    expect(result.errors).toEqual([])
    expect(result).toMatchObject({ pages: 28, authoredFiles: 84, sources: 344, diagrams: 37 })
  })

  it('produces one local-only row per page-scoped source record', async () => {
    const result = await auditSources({ projectRoot: PROJECT_ROOT, write: false })
    expectCompleteAuditContract(result, PROJECT_ROOT)
  })

  it('replays the exact complete committed ledger without a BB checkout', async () => {
    const result = await auditPortableFixture()
    expect(result.sourceRootAvailable).toBe(false)
    expectCompleteAuditContract(result, PROJECT_ROOT)
  })

  it.each(tamperCases)('rejects $name in portable mode', async ({ mutate, error }) => {
    const sourceMapBefore = fs.readFileSync(SOURCE_MAP_PATH, 'utf8')
    const result = await auditPortableFixture(mutate)
    expect(result.sourceRootAvailable).toBe(false)
    expect(result.errors.join('\n')).toMatch(error)
    expect(fs.readFileSync(SOURCE_MAP_PATH, 'utf8')).toBe(sourceMapBefore)
  })

  it('retains line endings when normalizing inclusive source windows', () => {
    expect(sha256(normalizeWindow('one\ntwo\nthree\n', 2, 2))).toBe(sha256('two\n'))
    expect(sha256(normalizeWindow('one\ntwo\n', 1, 3))).toBe(sha256('one\ntwo\n'))
  })

  it('rejects unsafe source paths, task ids, executable schemes, and credentials', () => {
    const record = {
      id: 'bad-source', type: 'bb-source', label: 'Observed', statement: 'See LBB-18',
      snapshot: { branch: 'main', commit: 'a'.repeat(40), dirty: false, observedAt: '2026-08-15' },
      path: '/Users/example/private.ts', symbol: 'bad', lineStart: 1, lineEnd: 1,
      windowSha256: 'TO_BE_COMPUTED_BY_SOURCE_AUDIT',
      public: { status: 'unverified', url: null, rawUrl: null, verifiedAt: null },
    }
    expect(validateSourceRecord(record, 'fixture').join('\n')).toMatch(/private|task id/)
    expect(scanForbiddenText('javascript:alert(1) ghp_abcdefghijklmnopqrstuvwxyz', 'fixture')).toHaveLength(2)
  })

  it('accepts only resolved static routes and a complete source map', () => {
    const result = auditStaticLinks(PROJECT_ROOT)
    expect(result.errors).toEqual([])
    expect(result).toMatchObject({ routes: 28, sourceMapRows: 344 })
  })
})
