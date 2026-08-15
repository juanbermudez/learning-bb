// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { sanitizeFetchedDiagram, validateDiagramSource } from './renderSanitizedSvg'

describe('sanitized diagram boundary', () => {
  it('sanitizes a finite SVG without font imports or event attributes', () => {
    const result = sanitizeFetchedDiagram('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="10" height="10"><style>@import url(https://example.com/font.css);</style><rect width="10" height="10" onload="alert(1)" /></svg>')
    expect(result.svg).toMatch(/^<svg\b/)
    expect(result.svg).not.toMatch(/@import|onload=|javascript:/i)
    expect(result.svg).toMatch(/viewBox|width=/)
  })

  it('fails closed for invalid Mermaid input', () => {
    expect(() => validateDiagramSource('xychart-beta\n  xychart-beta')).toThrow()
    expect(() => validateDiagramSource('graph LR\n  A --> B\n  click A "https://example.com"')).toThrow()
  })

  it('fails closed for unsafe fetched SVG structure', () => {
    expect(() => sanitizeFetchedDiagram('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')).toThrow()
  })
})
