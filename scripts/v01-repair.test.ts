import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const readProjectFile = (relativePath: string) => readFileSync(join(projectRoot, relativePath), 'utf8')

function count(source: string, pattern: RegExp) {
  return source.match(pattern)?.length ?? 0
}

describe('V01 rendered-finding repair contracts', () => {
  it('keeps a clean Pages order with one build, one budget gate, and one uploaded artifact', () => {
    const packageJson = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> }
    const workflow = readProjectFile('.github/workflows/pages.yml')
    const buildJob = workflow.slice(workflow.indexOf('  build:'), workflow.indexOf('\n  deploy:'))
    const deployJob = workflow.slice(workflow.indexOf('\n  deploy:'))
    const install = buildJob.indexOf('run: npm ci')
    const check = buildJob.indexOf('run: npm run check')
    const build = buildJob.indexOf('run: npm run build')
    const budgets = buildJob.indexOf('run: npm run check:budgets')
    const configure = buildJob.indexOf('uses: actions/configure-pages@')
    const upload = buildJob.indexOf('uses: actions/upload-pages-artifact@')

    expect(packageJson.scripts.check).not.toContain('check:budgets')
    expect(packageJson.scripts.check).toContain('audit:links')
    expect([install, check, build, budgets, configure, upload].every((position) => position >= 0)).toBe(true)
    expect(install).toBeLessThan(check)
    expect(check).toBeLessThan(build)
    expect(build).toBeLessThan(budgets)
    expect(budgets).toBeLessThan(configure)
    expect(configure).toBeLessThan(upload)
    expect(count(buildJob, /run: npm run build\b/g)).toBe(1)
    expect(count(buildJob, /run: npm run check:budgets\b/g)).toBe(1)
    expect(count(buildJob, /uses: actions\/upload-pages-artifact@/g)).toBe(1)
    expect(buildJob).toMatch(/with:\s*\n\s+path: dist/)
    expect(deployJob).not.toMatch(/npm run (?:build|check:budgets)/)
    expect(deployJob).toContain('uses: actions/deploy-pages@')
  })

  it('defines compact containment on the reading chain and inner scroll viewports', () => {
    const globalCss = readProjectFile('src/styles/global.css')
    const componentCss = readProjectFile('src/styles/components.css')

    expect(globalCss).toMatch(/\.page-column\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%/s)
    expect(globalCss).toMatch(/\.page-layout__reading\s*\{[^}]*min-width:\s*0;/s)
    expect(componentCss).toMatch(/\.doc-article__body\s*>\s*\*[^}]*max-width:\s*100%/s)
    expect(componentCss).toMatch(/\.data-table__scroll[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/s)
    expect(componentCss).toMatch(/\.diagram-viewport[^}]*max-width:\s*100%[^}]*overflow:\s*auto/s)
    expect(componentCss).toMatch(/\.sources-disclosure[^}]*max-width:\s*100%/s)
    expect(componentCss).toMatch(/\.source-card\s*>\s*\*[^}]*min-width:\s*0[^}]*max-width:\s*100%/s)
  })

  it('uses the exact light accent contrast token without changing the dark accent', () => {
    const tokens = readProjectFile('src/styles/tokens.css')
    const light = tokens.slice(0, tokens.indexOf("[data-theme='dark']"))
    const dark = tokens.slice(tokens.indexOf("[data-theme='dark']"), tokens.indexOf('@media (prefers-reduced-motion'))

    expect(light).toContain('--accent: oklch(0.55 0.18 250);')
    expect(light).toContain('--accent-soft: oklch(0.95 0.035 250);')
    expect(dark).toContain('--accent: oklch(0.72 0.14 250);')
    expect(count(tokens, /--evidence-observed:\s*var\(--accent\);/g)).toBe(2)
  })

  it('enforces the SourceCard target contract while keeping the optical label', () => {
    const css = readProjectFile('src/styles/components.css')
    const rule = css.match(/\.source-card__actions button, \.source-card__actions a\s*\{([^}]*)\}/)?.[1] ?? ''

    expect(rule).toContain('min-height: 44px')
    expect(rule).toContain('font-size: 12px')
  })

  it('declares a base-aware favicon backed by a safe local SVG', () => {
    const html = readProjectFile('index.html')
    const favicon = readProjectFile('public/favicon.svg')

    expect(html).toMatch(
      /<link rel="icon" type="image\/svg\+xml" href="%BASE_URL%favicon\.svg" vite-ignore\s*\/?>/,
    )
    expect(favicon).toMatch(/^<svg\b/)
    expect(favicon).not.toMatch(/<(?:script|foreignObject)\b|\bon\w+=|\bhref=|(?:javascript:|data:)/i)
  })
})
