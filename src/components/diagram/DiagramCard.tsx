import { useEffect, useRef, useState } from 'react'
import type { DiagramDefinition } from '../../content/schema'
import { EvidenceBadge } from '../content/EvidenceBadge'
import { DiagramDialog } from './DiagramDialog'

export function DiagramCard({ definition }: { definition: DiagramDefinition }) {
  const hostRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [nearViewport, setNearViewport] = useState(false)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (!('IntersectionObserver' in window)) { setNearViewport(true); return }
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setNearViewport(true); observer.disconnect() } }, { rootMargin: '300px' })
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!nearViewport || svg || error) return
    let cancelled = false
    import('./renderSanitizedSvg').then(({ renderSanitizedDiagram }) => {
      if (cancelled) return
      try { setSvg(renderSanitizedDiagram(definition.code).svg) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to render this diagram.') }
    }).catch(() => setError('The diagram renderer could not load.'))
    return () => { cancelled = true }
  }, [definition.code, error, nearViewport, svg])

  return (
    <figure ref={hostRef} className="diagram-card" aria-labelledby={`${definition.id}-title`}>
      <div className="diagram-card__header"><div><div id={`${definition.id}-title`} className="diagram-card__title">{definition.title}</div><div className="diagram-card__legend">{definition.evidenceMix.map((label) => <EvidenceBadge key={label} label={label} />)}</div></div><div className="diagram-card__controls"><button ref={triggerRef} type="button" onClick={() => setDialogOpen(true)} disabled={!svg} aria-disabled={!svg}>{svg ? 'Open large diagram' : 'Large view unavailable'}</button></div></div>
      <div className="diagram-viewport" aria-busy={nearViewport && !svg && !error}>
        {!nearViewport ? <div className="diagram-placeholder"><strong>Diagram ready near the reading position.</strong><span>Rendering stays out of the initial page bundle.</span></div> : error ? <div className="diagram-error"><strong>Diagram fallback</strong><span>{error}</span></div> : svg ? <div className="diagram-viewport__svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="diagram-placeholder"><strong>Rendering diagram…</strong><span>Its text alternative remains available below.</span></div>}
      </div>
      <figcaption className="diagram-card__caption">{definition.caption}</figcaption>
      <details className="diagram-text-alt"><summary>Read diagram as text</summary><p>{definition.textAlternative}</p></details>
      {svg && <DiagramDialog definition={definition} svg={svg} open={dialogOpen} onClose={() => setDialogOpen(false)} triggerRef={triggerRef} />}
    </figure>
  )
}
