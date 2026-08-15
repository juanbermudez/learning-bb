import { renderMermaidSVG } from 'beautiful-mermaid'
import DOMPurify from 'dompurify'

export interface DiagramRenderResult { svg: string }

function finitePositive(value: string | null): boolean {
  if (!value) return false
  const number = Number.parseFloat(value)
  return Number.isFinite(number) && number > 0
}

function validateStructure(svgText: string): string {
  const parser = new DOMParser()
  const document = parser.parseFromString(svgText, 'image/svg+xml')
  const root = document.documentElement
  if (!root || root.nodeName.toLowerCase() !== 'svg') throw new Error('The diagram renderer did not return one SVG root.')
  if (document.querySelector('parsererror, script, foreignObject')) throw new Error('The SVG contains a forbidden element.')
  const viewBox = root.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number)
  const viewBoxValid = viewBox?.length === 4 && viewBox.every((value) => Number.isFinite(value)) && viewBox[2] > 0 && viewBox[3] > 0
  const dimensionsValid = finitePositive(root.getAttribute('width')) && finitePositive(root.getAttribute('height'))
  if (!viewBoxValid && !dimensionsValid) throw new Error('The SVG has no finite positive dimensions.')
  if (/<\s*(script|foreignObject)\b|\bon[a-z]+\s*=|javascript:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svgText)) throw new Error('The SVG contains a forbidden token.')
  return root.outerHTML
}

export function renderSanitizedDiagram(code: string): DiagramRenderResult {
  const source = code.trim()
  if (!/^(graph|flowchart|stateDiagram-v2|sequenceDiagram|classDiagram|erDiagram)\b/m.test(source)) throw new Error('Unsupported diagram family.')
  if (/^\s*(click|init|linkStyle|xychart-beta)\b|https?:\/\/|javascript:|<\s*\w+/im.test(source)) throw new Error('Unsupported diagram directive.')
  const rendered = renderMermaidSVG(source, {
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
  }).replace(/@import[^;]+;?/gi, '')
  const sanitized = DOMPurify.sanitize(rendered, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['href', 'xlink:href', 'onload', 'onclick', 'onerror', 'onmouseover'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
  return { svg: validateStructure(sanitized) }
}
