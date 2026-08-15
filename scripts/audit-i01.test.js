import { describe, expect, it } from 'vitest'
import { auditContent } from './audit-content.mjs'
import { PROJECT_ROOT, normalizeWindow, scanForbiddenText, sha256, validateSourceRecord } from './audit-helpers.mjs'
import { auditSources } from './audit-source-links.mjs'
import { auditStaticLinks } from './audit-static-links.mjs'

describe('I01 fail-closed integration audits', () => {
  it('accepts the exact authored inventory and page budgets', () => {
    const result = auditContent(PROJECT_ROOT)
    expect(result.errors).toEqual([])
    expect(result).toMatchObject({ pages: 28, authoredFiles: 84, sources: 344, diagrams: 37 })
  })

  it('produces one local-only row per page-scoped source record', async () => {
    const result = await auditSources({ projectRoot: PROJECT_ROOT, write: false })
    expect(result.errors).toEqual([])
    expect(result).toMatchObject({ records: 344, bbSources: 322, verified: 0, localOnly: 344, sourceRootAvailable: true })
    expect(Object.keys(result.ledger)[0]).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+$/)
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
