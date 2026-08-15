interface SvgParser {
  parseFromString(svgText: string, contentType: 'image/svg+xml'): Document
}

interface SvgPurifier {
  sanitize(svgText: string, options?: Record<string, unknown>): string
}

export function validateDiagramSource(code: string): string
export function validateSvgStructure(svgText: string, parser?: SvgParser): string
export function sanitizeDiagramSvg(rendered: string, purifier: SvgPurifier, parser?: SvgParser): string

export const DIAGRAM_DIRECTIVE_PATTERN: RegExp
export const DIAGRAM_FAMILY_PATTERN: RegExp
export const SVG_SANITIZE_OPTIONS: Readonly<Record<string, unknown>>
