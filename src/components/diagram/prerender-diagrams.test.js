// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'
import { renderMermaidSVG } from 'beautiful-mermaid'
import { describe, expect, it } from 'vitest'
import { extractDefinitions } from '../../../scripts/prerender-diagrams.mjs'
import { sanitizeDiagramSvg, validateDiagramSource, validateSvgStructure } from './diagramSanitizer.mjs'

const projectRoot = path.resolve(process.cwd())
const baseRenderOptions = {
  bg: 'var(--surface)',
  fg: 'var(--ink)',
  line: 'var(--line-strong)',
  accent: 'var(--accent)',
  muted: 'var(--ink-muted)',
  surface: 'var(--surface-subtle)',
  border: 'var(--line-strong)',
  transparent: true,
  font: 'Inter, ui-sans-serif, sans-serif',
  padding: 32,
  nodeSpacing: 24,
  layerSpacing: 40,
}
const baseSanitizeOptions = {
  USE_PROFILES: { svg: true, svgFilters: true },
  FORBID_TAGS: ['script', 'foreignObject'],
  FORBID_ATTR: ['href', 'xlink:href', 'onload', 'onclick', 'onerror', 'onmouseover'],
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

describe('build-time diagram outputs', () => {
  it('emits one guarded, sanitized SVG for every extracted definition', async () => {
    const definitions = extractDefinitions(projectRoot)
    const generated = await import('../../generated/diagram-manifest')
    const manifest = generated.diagramManifest
    const files = fs.readdirSync(path.join(projectRoot, 'public', 'diagrams')).filter((file) => file.endsWith('.svg')).sort()
    expect(definitions).toHaveLength(37)
    expect(files).toHaveLength(37)
    expect(Object.keys(manifest).sort()).toEqual(definitions.map(({ code }) => code).sort())

    const dom = new JSDOM('')
    const purifier = createDOMPurify(dom.window)
    const parser = new dom.window.DOMParser()
    try {
      for (const definition of definitions) {
        expect(() => validateDiagramSource(definition.code)).not.toThrow()
        const url = manifest[definition.code]
        expect(url).toMatch(/(?:^|\/)diagrams\/diagram-[a-f0-9]{24}\.svg$/)
        const file = path.join(projectRoot, 'public', 'diagrams', path.basename(new URL(url, 'https://example.test').pathname))
        const svg = fs.readFileSync(file, 'utf8')
        expect(sanitizeDiagramSvg(svg, purifier, parser)).toBe(svg.trim())
        expect(svg).not.toMatch(/<\s*(script|foreignObject)\b|\bon[a-z]+\s*=|javascript:/i)
      }
    } finally {
      dom.window.close()
    }
  })

  it('matches the base runtime render and sanitizer semantics for all 37 diagrams', async () => {
    const definitions = extractDefinitions(projectRoot)
    const { diagramManifest } = await import('../../generated/diagram-manifest')
    const dom = new JSDOM('')
    const purifier = createDOMPurify(dom.window)
    const parser = new dom.window.DOMParser()
    try {
      for (const definition of definitions) {
        const rendered = renderMermaidSVG(definition.code.trim(), baseRenderOptions).replace(/@import[^;]+;?/gi, '')
        const sanitized = purifier.sanitize(rendered, baseSanitizeOptions)
        const baseRuntimeSvg = validateSvgStructure(sanitized, parser)
        const generatedFile = path.join(projectRoot, 'public', 'diagrams', path.basename(new URL(diagramManifest[definition.code], 'https://example.test').pathname))
        expect(fs.readFileSync(generatedFile, 'utf8').trim()).toBe(baseRuntimeSvg)
      }
    } finally {
      dom.window.close()
    }
  })

  it('fails closed when a diagram definition contains a dynamic value', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lbb-b02c-extraction-'))
    const contentRoot = path.join(fixtureRoot, 'src', 'content')
    fs.mkdirSync(contentRoot, { recursive: true })
    try {
      for (let index = 0; index < 28; index += 1) {
        const body = index === 0
          ? "const code = 'graph LR\\n  A --> B'\ndefineDiagramDefinition({ id: 'dynamic', title: 'Dynamic', caption: 'Dynamic', evidenceMix: [], sourceIds: [], code: code, textAlternative: 'Dynamic' })\n"
          : ''
        fs.writeFileSync(path.join(contentRoot, `${index}.page.tsx`), body, 'utf8')
      }
      expect(() => extractDefinitions(fixtureRoot)).toThrow(/B02C S2: .*code must be a string literal without substitutions/)
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })
})
