const DIAGRAM_FAMILY_PATTERN = /^(graph|flowchart|stateDiagram-v2|sequenceDiagram|classDiagram|erDiagram)\b/m
const DIAGRAM_DIRECTIVE_PATTERN = /^\s*(click|init|linkStyle|xychart-beta)\b|https?:\/\/|javascript:|<\s*\w+/im

const SVG_SANITIZE_OPTIONS = {
  USE_PROFILES: { svg: true, svgFilters: true },
  FORBID_TAGS: ['script', 'foreignObject'],
  FORBID_ATTR: ['href', 'xlink:href', 'onload', 'onclick', 'onerror', 'onmouseover'],
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

function finitePositive(value) {
  if (!value) return false
  const number = Number.parseFloat(value)
  return Number.isFinite(number) && number > 0
}

function parseSvg(svgText, parser) {
  if (parser && typeof parser.parseFromString === 'function') {
    return parser.parseFromString(svgText, 'image/svg+xml')
  }
  if (typeof DOMParser === 'function') {
    return new DOMParser().parseFromString(svgText, 'image/svg+xml')
  }
  throw new Error('The SVG parser is unavailable.')
}

export function validateDiagramSource(code) {
  if (typeof code !== 'string') throw new Error('Diagram source must be a string.')
  const source = code.trim()
  if (!DIAGRAM_FAMILY_PATTERN.test(source)) throw new Error('Unsupported diagram family.')
  if (DIAGRAM_DIRECTIVE_PATTERN.test(source)) throw new Error('Unsupported diagram directive.')
  return source
}

export function validateSvgStructure(svgText, parser) {
  const document = parseSvg(svgText, parser)
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

export function sanitizeDiagramSvg(rendered, purifier, parser) {
  if (typeof rendered !== 'string') throw new Error('The diagram renderer did not return SVG text.')
  if (!purifier || typeof purifier.sanitize !== 'function') throw new Error('The SVG sanitizer is unavailable.')
  const withoutFontImports = rendered.replace(/@import[^;]+;?/gi, '')
  const sanitized = purifier.sanitize(withoutFontImports, SVG_SANITIZE_OPTIONS)
  return validateSvgStructure(sanitized, parser)
}

export { DIAGRAM_DIRECTIVE_PATTERN, DIAGRAM_FAMILY_PATTERN, SVG_SANITIZE_OPTIONS }
