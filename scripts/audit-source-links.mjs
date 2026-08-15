#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PLACEHOLDER_HASH,
  PROJECT_ROOT,
  SHA256_PATTERN,
  contentTriplets,
  failWith,
  normalizeWindow,
  parseMeta,
  sha256,
  validateSourceRecord,
} from './audit-helpers.mjs'

function resolveSourceRoot(projectRoot, explicitRoot) {
  const candidates = [
    explicitRoot,
    process.env.LEARNING_BB_SOURCE_ROOT,
    path.resolve(projectRoot, '..', 'kira-agent'),
    path.join(os.homedir(), 'Desktop', 'kira-agent'),
  ].filter(Boolean)
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, '.git'))) ?? null
}

function isImmutableGithubUrl(value, raw = false) {
  if (typeof value !== 'string') return false
  const pattern = raw
    ? /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[a-f0-9]{40}\/.+/i
    : /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[a-f0-9]{40}\/.+#L\d+(?:-L\d+)?$/i
  return pattern.test(value)
}

async function fetchVerifiedWindow(record, errors, label) {
  if (!isImmutableGithubUrl(record.public.url) || !isImmutableGithubUrl(record.public.rawUrl, true)) {
    errors.push(`${label}: verified links must use immutable GitHub commit URLs with an exact line fragment`)
    return null
  }
  let response
  try {
    response = await fetch(record.public.rawUrl, { signal: AbortSignal.timeout(15_000), redirect: 'follow' })
  } catch (cause) {
    errors.push(`${label}: verified raw URL request failed (${cause instanceof Error ? cause.message : String(cause)})`)
    return null
  }
  if (!response.ok) {
    errors.push(`${label}: verified raw URL returned ${response.status}`)
    return null
  }
  return normalizeWindow(await response.text(), record.lineStart, record.lineEnd)
}

function readCommittedLedger(projectRoot) {
  const outputPath = path.join(projectRoot, 'public', 'source-map.json')
  if (!fs.existsSync(outputPath)) return {}
  return JSON.parse(fs.readFileSync(outputPath, 'utf8'))
}

export async function auditSources({ projectRoot = PROJECT_ROOT, sourceRoot, write = true } = {}) {
  const errors = []
  const resolvedSourceRoot = resolveSourceRoot(projectRoot, sourceRoot)
  const priorLedger = readCommittedLedger(projectRoot)
  if (!resolvedSourceRoot && !Object.keys(priorLedger).length) errors.push('BB source checkout is unavailable and no committed source-map ledger can be replayed')
  const ledger = {}
  let bbSourceCount = 0
  let verifiedCount = 0
  let localOnlyCount = 0
  let replayedHashCount = 0

  for (const triplet of contentTriplets(projectRoot)) {
    if (!fs.existsSync(triplet.metaPath) || !fs.existsSync(triplet.sourcesPath)) continue
    const meta = parseMeta(triplet.metaPath)
    const records = JSON.parse(fs.readFileSync(triplet.sourcesPath, 'utf8'))
    const seen = new Set()
    for (const [index, record] of records.entries()) {
      const label = `${triplet.stem}.sources[${index}]`
      errors.push(...validateSourceRecord(record, label))
      if (seen.has(record.id)) errors.push(`${triplet.stem}: duplicate source id ${record.id}`)
      seen.add(record.id)
      const key = `${meta.id}/${record.id}`
      if (ledger[key]) errors.push(`${key}: duplicate public source-map key`)
      let windowSha256 = null
      let status = 'local-only'
      let publicUrl = null
      let verifiedAt = null

      if (record.type === 'bb-source') {
        bbSourceCount += 1
        if (resolvedSourceRoot) {
          const sourcePath = path.resolve(resolvedSourceRoot, record.path)
          const relative = path.relative(resolvedSourceRoot, sourcePath)
          if (relative.startsWith('..') || path.isAbsolute(relative)) errors.push(`${label}: source path escapes the BB checkout`)
          else if (!fs.existsSync(sourcePath)) errors.push(`${label}: BB source file does not exist (${record.path})`)
          else {
            try {
              const window = normalizeWindow(fs.readFileSync(sourcePath, 'utf8'), record.lineStart, record.lineEnd)
              windowSha256 = sha256(window)
              if (record.windowSha256 !== PLACEHOLDER_HASH && record.windowSha256 !== windowSha256) errors.push(`${label}: stored window SHA-256 does not match normalized snapshot bytes`)
            } catch (cause) {
              errors.push(`${label}: ${cause instanceof Error ? cause.message : String(cause)}`)
            }
          }
        } else {
          windowSha256 = priorLedger[key]?.windowSha256 ?? null
          if (!SHA256_PATTERN.test(windowSha256 ?? '')) errors.push(`${key}: committed source-map row lacks a replayable SHA-256`)
          else {
            replayedHashCount += 1
            if (record.windowSha256 !== PLACEHOLDER_HASH && record.windowSha256 !== windowSha256) errors.push(`${key}: authored SHA-256 differs from the committed source-map projection`)
          }
        }
        if (record.public.status === 'verified') {
          const publicWindow = await fetchVerifiedWindow(record, errors, label)
          if (publicWindow) {
            const publicHash = sha256(publicWindow)
            if (publicHash !== windowSha256) errors.push(`${label}: immutable public window hash does not match the local snapshot`)
            else {
              status = 'verified'
              publicUrl = record.public.url
              verifiedAt = record.public.verifiedAt
              verifiedCount += 1
            }
          }
        }
      }
      if (status === 'local-only') localOnlyCount += 1
      ledger[key] = { status, publicUrl, verifiedAt, windowSha256 }
    }
  }

  const sortedLedger = Object.fromEntries(Object.entries(ledger).sort(([left], [right]) => left.localeCompare(right)))
  if (Object.keys(sortedLedger).length !== 344) errors.push(`expected 344 page-scoped source records, found ${Object.keys(sortedLedger).length}`)
  if (bbSourceCount !== 322) errors.push(`expected 322 BB implementation source records, found ${bbSourceCount}`)
  if (write && !errors.length && resolvedSourceRoot) fs.writeFileSync(path.join(projectRoot, 'public', 'source-map.json'), `${JSON.stringify(sortedLedger, null, 2)}\n`, 'utf8')
  if (!resolvedSourceRoot && !errors.length && JSON.stringify(sortedLedger) !== JSON.stringify(priorLedger)) errors.push('committed source-map projection is not deterministic')
  return {
    errors,
    ledger: sortedLedger,
    records: Object.keys(sortedLedger).length,
    bbSources: bbSourceCount,
    verified: verifiedCount,
    localOnly: localOnlyCount,
    replayedHashes: replayedHashCount,
    sourceRootAvailable: Boolean(resolvedSourceRoot),
  }
}

export async function main() {
  const result = await auditSources()
  if (result.errors.length) return failWith(result.errors, 'Public source audit failed')
  const mode = result.sourceRootAvailable ? `${result.bbSources} BB windows normalized` : `${result.replayedHashes} committed BB hashes replayed`
  console.log(`Source audit passed: ${result.records} page-scoped records, ${mode}, ${result.verified} verified, ${result.localOnly} local-only.`)
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) await main()
