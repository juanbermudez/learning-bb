import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { PageMeta } from '../../content/schema'
import type { SectionDefinition } from '../../app/navigation'
import { SECTION_DEFINITIONS } from '../../app/navigation'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  activeSection?: SectionDefinition
  pagesBySection: ReadonlyMap<string, readonly PageMeta[]>
}

export function MobileNavDialog({ open, onClose, activeSection, pagesBySection }: Props) {
  const location = useLocation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [selected, setSelected] = useState(activeSection?.id ?? SECTION_DEFINITIONS[0].id)

  useEffect(() => {
    if (activeSection) setSelected(activeSection.id)
  }, [activeSection])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement
      try { dialog.showModal() } catch { dialog.setAttribute('open', '') }
      document.body.dataset.scrollLocked = 'true'
      document.body.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }
    return () => {
      document.body.style.overflow = ''
      delete document.body.dataset.scrollLocked
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = (event: Event) => { event.preventDefault(); onClose() }
    const onCloseEvent = () => {
      document.body.style.overflow = ''
      delete document.body.dataset.scrollLocked
      if (triggerRef.current?.isConnected) triggerRef.current.focus()
    }
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('close', onCloseEvent)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('close', onCloseEvent)
    }
  }, [onClose])

  const pages = pagesBySection.get(selected) ?? []
  return (
    <dialog ref={dialogRef} className="mobile-nav-dialog dialog-backdrop" aria-labelledby="mobile-nav-title">
      <div className="mobile-nav-dialog__inner">
        <div className="dialog-header">
          <h2 id="mobile-nav-title">Navigate</h2>
          <button type="button" className="icon-button" aria-label="Close navigation" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="mobile-nav-dialog__sections" role="tablist" aria-label="Sections">
          {SECTION_DEFINITIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={selected === section.id}
              onClick={() => setSelected(section.id)}
            >
              {section.shortLabel}
            </button>
          ))}
        </div>
        <nav className="mobile-nav-dialog__pages" aria-label={`${selected} pages`}>
          {pages.length > 0 ? pages.map((page) => (
            <Link key={page.id} to={page.route} aria-current={location.pathname === page.route ? 'page' : undefined} onClick={onClose}>
              {page.navTitle}
            </Link>
          )) : <div className="mobile-nav-dialog__empty">Authored pages will appear here when the content registry is integrated.</div>}
        </nav>
      </div>
    </dialog>
  )
}
