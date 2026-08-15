// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderSanitizedDiagram } from './renderSanitizedSvg'

describe('sanitized diagram boundary', () => {
  it('renders a finite SVG without font imports or event attributes', () => {
    const result = renderSanitizedDiagram('graph LR\n  A[Browser] --> B[Server]')
    expect(result.svg).toMatch(/^<svg\b/)
    expect(result.svg).not.toMatch(/@import|onload=|javascript:/i)
    expect(result.svg).toMatch(/viewBox|width=/)
  })

  it('fails closed for invalid Mermaid input', () => {
    expect(() => renderSanitizedDiagram('xychart-beta\n  xychart-beta')).toThrow()
  })
})
