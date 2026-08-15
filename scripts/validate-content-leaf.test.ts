import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd())
const validator = resolve(root, 'scripts/validate-content-leaf.mjs')
const fixtureRoot = resolve(root, 'tests/fixtures/content-leaf')

function runFixture(name: string) {
  return spawnSync(process.execPath, [validator, resolve(fixtureRoot, name)], {
    cwd: root,
    encoding: 'utf8',
  })
}

describe('directory-scoped content leaf validator', () => {
  it('accepts a valid page triplet', () => {
    const result = runFixture('valid')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Content leaf validation passed')
  })

  it('rejects a missing triplet file', () => {
    const result = runFixture('missing-file')
    expect(result.status).not.toBe(0)
    expect(`${result.stdout}\n${result.stderr}`).toContain('missing triplet file lesson.sources.json')
  })

  it('rejects duplicate routes and reading orders within one directory', () => {
    const result = runFixture('duplicate-route-order')
    const output = `${result.stdout}\n${result.stderr}`
    expect(result.status).not.toBe(0)
    expect(output).toContain('duplicate route /runtime/same')
    expect(output).toContain('duplicate reading order 8')
  })

  it('rejects evidence labels outside the four-label vocabulary', () => {
    const result = runFixture('invalid-evidence')
    const output = `${result.stdout}\n${result.stderr}`
    expect(result.status).not.toBe(0)
    expect(output).toContain('invalid evidence label current')
    expect(output).toContain('must be Observed, Inference, Proposed, or Unknown')
  })

  it('rejects absolute local source paths', () => {
    const result = runFixture('absolute-path')
    expect(result.status).not.toBe(0)
    expect(`${result.stdout}\n${result.stderr}`).toContain('absolute, private, or non-portable path is forbidden')
  })

  it('rejects source windows outside the inclusive 1-80 line contract', () => {
    const result = runFixture('invalid-source-window')
    expect(result.status).not.toBe(0)
    expect(`${result.stdout}\n${result.stderr}`).toContain('source window must be an inclusive 1-80 line range')
  })

  it('keeps the fixtures directory-scoped and free of private path literals', () => {
    const fixtureFiles = [
      'valid/lesson.meta.ts',
      'valid/lesson.page.tsx',
      'valid/lesson.sources.json',
    ]
    for (const relativePath of fixtureFiles) {
      expect(readFileSync(resolve(fixtureRoot, relativePath), 'utf8')).not.toContain('/Users/')
    }
  })
})
