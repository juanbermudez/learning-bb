import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

const checkerPath = fileURLToPath(new URL('./check-budgets.mjs', import.meta.url))

function createFixture(html: string, files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'learning-bb-budget-'))
  writeFileSync(join(root, 'index.html'), html)
  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = join(root, relativePath)
    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, contents)
  }
  return root
}

function runChecker(distDirectory: string) {
  const result = spawnSync(process.execPath, [checkerPath, distDirectory], {
    encoding: 'utf8',
  })
  return {
    status: result.status ?? -1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  }
}

function gzipKiB(filePath: string) {
  return (gzipSync(readFileSync(filePath), { level: 9 }).byteLength / 1024).toFixed(1)
}

function deterministicPayload(length: number, seed: number) {
  let state = seed >>> 0
  let payload = ''
  for (let index = 0; index < length; index += 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    payload += String.fromCharCode(33 + (state % 94))
  }
  return payload
}

describe('production budget checker', () => {
  it('measures base-prefixed initial assets and reports non-zero gzip sizes', () => {
    const html = `<!doctype html>
<script type="module" src="/learning-bb/assets/entry.js"></script>
<link rel="stylesheet" href="/learning-bb/assets/site.css">
`
    const fixture = createFixture(html, {
      'assets/entry.js': deterministicPayload(512, 7),
      'assets/site.css': deterministicPayload(512, 13),
      'assets/routes/deep/nested-route.js': 'export const route = true\n',
      'assets/diagrams/deep/nested-diagram.js': 'const renderer = "beautiful-mermaid"\n',
    })

    try {
      const result = runChecker(fixture)
      const initialJs = gzipKiB(join(fixture, 'assets/entry.js'))
      const initialCss = gzipKiB(join(fixture, 'assets/site.css'))
      const transfer = (
        gzipSync(Buffer.from(html), { level: 9 }).byteLength
        + gzipSync(readFileSync(join(fixture, 'assets/entry.js')), { level: 9 }).byteLength
        + gzipSync(readFileSync(join(fixture, 'assets/site.css')), { level: 9 }).byteLength
      ) / 1024

      expect(result.status).toBe(0)
      expect(result.output).toContain(`Initial JS ${initialJs} KiB gzip; CSS ${initialCss} KiB gzip; transfer ${transfer.toFixed(1)} KiB gzip; requests 3`)
      expect(result.output).not.toContain('Initial JS 0.0 KiB gzip')
      expect(result.output).not.toContain('CSS 0.0 KiB gzip')
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it('resolves root-relative and HTML-relative asset references without a base prefix', () => {
    const fixture = createFixture(`<!doctype html>
<script type="module" src="/assets/entry.js"></script>
<link rel="stylesheet" href="./assets/site.css">
`, {
      'assets/entry.js': deterministicPayload(512, 17),
      'assets/site.css': deterministicPayload(512, 23),
    })

    try {
      const result = runChecker(fixture)
      expect(result.status).toBe(0)
      expect(result.output).not.toContain('Initial JS 0.0 KiB gzip')
      expect(result.output).not.toContain('CSS 0.0 KiB gzip')
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it('discovers nested lazy chunks and keeps route and diagram budgets distinct', () => {
    const fixture = createFixture(`<!doctype html>
<script type="module" src="/learning-bb/assets/entry.js"></script>
<link rel="stylesheet" href="/learning-bb/assets/site.css">
`, {
      'assets/entry.js': 'export const entry = true\n',
      'assets/site.css': 'body { color: #111; }\n',
      'assets/routes/deep/nested-route.js': deterministicPayload(90_000, 11),
      'assets/diagrams/deep/nested-diagram.js': `const renderer = "beautiful-mermaid"\n${deterministicPayload(140_000, 29)}`,
    })

    try {
      const result = runChecker(fixture)
      const routeSize = gzipKiB(join(fixture, 'assets/routes/deep/nested-route.js'))
      const diagramSize = gzipKiB(join(fixture, 'assets/diagrams/deep/nested-diagram.js'))

      expect(result.status).toBe(1)
      expect(result.output).toContain(`nested-route.js ${routeSize} KiB gzip exceeds 45 KiB route budget`)
      expect(result.output).toContain(`nested-diagram.js ${diagramSize} KiB gzip exceeds 90 KiB diagram budget`)
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it.each([
    {
      kind: 'JavaScript',
      html: `<!doctype html>
<script type="module" src="/learning-bb/assets/missing.js"></script>
<link rel="stylesheet" href="/learning-bb/assets/site.css">
`,
      files: { 'assets/site.css': deterministicPayload(512, 31) },
      reference: '/learning-bb/assets/missing.js',
    },
    {
      kind: 'CSS',
      html: `<!doctype html>
<script type="module" src="/learning-bb/assets/entry.js"></script>
<link rel="stylesheet" href="/learning-bb/assets/missing.css">
`,
      files: { 'assets/entry.js': deterministicPayload(512, 37) },
      reference: '/learning-bb/assets/missing.css',
    },
  ])('fails closed for a missing local $kind reference', ({ kind, html, files, reference }) => {
    const fixture = createFixture(html, files)

    try {
      const result = runChecker(fixture)
      expect(result.status).toBe(1)
      expect(result.output).toContain(`missing local ${kind} asset referenced by`)
      expect(result.output).toContain(reference)
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it('fails closed when the React build has zero initial JavaScript assets', () => {
    const fixture = createFixture(`<!doctype html>
<link rel="stylesheet" href="/learning-bb/assets/site.css">
`, {
      'assets/site.css': deterministicPayload(512, 41),
    })

    try {
      const result = runChecker(fixture)
      expect(result.status).toBe(1)
      expect(result.output).toContain('zero initial JavaScript assets resolved from dist/index.html')
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

})
