import { useEffect, useRef, useState } from 'react'
import { CloseIcon } from '../navigation/icons'
import { EvidenceBadge } from '../content/EvidenceBadge'
import type { DiagramDefinition } from '../../content/schema'

const ZOOM_STEPS = [50, 75, 100, 125, 150, 175, 200] as const

interface Props { definition: DiagramDefinition; svg: string; open: boolean; onClose: () => void; triggerRef: React.RefObject<HTMLButtonElement | null> }

export function DiagramDialog({ definition, svg, open, onClose, triggerRef }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [zoom, setZoom] = useState<number | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      try { dialog.showModal() } catch { dialog.setAttribute('open', '') }
      setZoom(null)
      queueMicrotask(() => dialog.querySelector<HTMLElement>('[data-dialog-heading]')?.focus())
      document.body.style.overflow = 'hidden'
    } else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = (event: Event) => { event.preventDefault(); onClose() }
    const onCloseEvent = () => {
      document.body.style.overflow = ''
      if (triggerRef.current?.isConnected) triggerRef.current.focus()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!viewportRef.current || document.activeElement !== viewportRef.current && !viewportRef.current.contains(document.activeElement)) return
      if (event.key === '+') { event.preventDefault(); setZoom((value) => nextZoom(value, 1)) }
      if (event.key === '-') { event.preventDefault(); setZoom((value) => nextZoom(value, -1)) }
      if (event.key === '0') { event.preventDefault(); setZoom(null) }
    }
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('close', onCloseEvent)
    dialog.addEventListener('keydown', onKeyDown)
    return () => { dialog.removeEventListener('cancel', onCancel); dialog.removeEventListener('close', onCloseEvent); dialog.removeEventListener('keydown', onKeyDown) }
  }, [onClose, triggerRef])

  const scale = zoom ? `${zoom / 100}` : 'fit'
  return (
    <dialog ref={dialogRef} className="diagram-dialog dialog-backdrop" aria-labelledby={`${definition.id}-dialog-title`}>
      <div className="diagram-dialog__inner">
        <div className="diagram-dialog__toolbar">
          <h2 id={`${definition.id}-dialog-title`} data-dialog-heading tabIndex={-1}>{definition.title}</h2>
          <div className="diagram-card__legend">{definition.evidenceMix.map((label) => <EvidenceBadge key={label} label={label} />)}</div>
          <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom((value) => nextZoom(value, -1))}>−</button>
          <button type="button" className="zoom-readout" aria-label={zoom ? `Zoom ${zoom}%` : 'Fit to viewport'} title="Fit or zoom percentage" onClick={() => setZoom(null)}>{zoom ? `${zoom}%` : 'Fit'}</button>
          <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom((value) => nextZoom(value, 1))}>+</button>
          <button type="button" aria-label="Fit diagram" title="Fit diagram" onClick={() => setZoom(null)}>Fit</button>
          <button type="button" className="icon-button" aria-label="Close large diagram" onClick={onClose}><CloseIcon /></button>
        </div>
        <div ref={viewportRef} className="diagram-dialog__viewport" tabIndex={0} aria-label="Diagram viewport; use scroll to pan">
          <div className="diagram-dialog__canvas" style={zoom ? { minWidth: `${zoom}%`, minHeight: `${zoom}%` } : undefined}>
            <div className="diagram-viewport__svg" style={zoom ? { width: `${zoom}%` } : { width: '100%' }} data-scale={scale} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
        <div className="diagram-dialog__caption">{definition.caption}</div>
      </div>
    </dialog>
  )
}

function nextZoom(current: number | null, delta: number): number {
  const index = current === null ? 2 : ZOOM_STEPS.indexOf(current as (typeof ZOOM_STEPS)[number])
  return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, index + delta))]
}
