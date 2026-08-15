import DOMPurify from 'dompurify'
import { sanitizeDiagramSvg, validateDiagramSource } from './diagramSanitizer.mjs'

export interface DiagramRenderResult { svg: string }

/**
 * Sanitize a pre-rendered diagram fetched from the generated asset manifest.
 * Beautiful Mermaid runs only in the build step; this is a small defense-in-
 * depth pass before SVG text reaches the DOM.
 */
export function sanitizeFetchedDiagram(svgText: string): DiagramRenderResult {
  return { svg: sanitizeDiagramSvg(svgText, DOMPurify) }
}

export { validateDiagramSource }
