import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PageMeta } from '../../content/schema'
import { searchPages, SEARCH_INTENTS, type SearchRecord } from './search'
import { CloseIcon, SearchIcon } from '../navigation/icons'

interface Props {
  open: boolean
  onClose: () => void
  pages: readonly PageMeta[]
}

export function SearchDialog({ open, onClose, pages }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = searchPages(pages, query)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement
      try { dialog.showModal() } catch { dialog.setAttribute('open', '') }
      setQuery('')
      setActive(0)
      queueMicrotask(() => inputRef.current?.focus())
    } else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = (event: Event) => { event.preventDefault(); onClose() }
    const onCloseEvent = () => { if (triggerRef.current?.isConnected) triggerRef.current.focus() }
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('close', onCloseEvent)
    return () => { dialog.removeEventListener('cancel', onCancel); dialog.removeEventListener('close', onCloseEvent) }
  }, [onClose])

  const moveActive = (delta: number) => {
    if (!results.length) return
    setActive((current) => (current + delta + results.length) % results.length)
  }
  const goTo = (result: SearchRecord) => { onClose(); setQuery(''); window.requestAnimationFrame(() => { window.location.hash = result.meta.route }) }

  return (
    <dialog ref={dialogRef} className="search-dialog dialog-backdrop" aria-labelledby="search-title">
      <div className="search-dialog__inner">
        <div className="search-dialog__input-wrap">
          <SearchIcon />
          <label htmlFor="search-input" id="search-title" className="sr-only">Search documentation</label>
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            value={query}
            placeholder="Search the snapshot"
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-result-${results[active].meta.id}` : undefined}
            onChange={(event) => { setQuery(event.target.value); setActive(0) }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(1) }
              if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(-1) }
              if (event.key === 'Home') { event.preventDefault(); setActive(0) }
              if (event.key === 'End') { event.preventDefault(); setActive(Math.max(0, results.length - 1)) }
              if (event.key === 'Enter' && results[active]) { event.preventDefault(); goTo(results[active]) }
            }}
          />
          <button type="button" className="icon-button" aria-label="Close search" onClick={onClose}><CloseIcon /></button>
        </div>
        <div id="search-results" className="search-dialog__results" role="listbox" aria-label="Search results">
          {!query ? (
            <div className="search-empty">
              <strong>Start with a reader intent</strong>
              <div className="search-empty__intents">
                {SEARCH_INTENTS.map((intent) => <button key={intent} type="button" className="search-empty__intent" onClick={() => setQuery(intent)}>{intent}</button>)}
              </div>
            </div>
          ) : results.length ? (
            results.map((result, index) => (
              <Link
                key={result.meta.id}
                id={`search-result-${result.meta.id}`}
                className="search-result"
                to={result.meta.route}
                role="option"
                aria-selected={active === index}
                onMouseEnter={() => setActive(index)}
                onClick={(event) => { event.preventDefault(); goTo(result) }}
              >
                <span className="search-result__title">{result.meta.title}</span>
                <span className="search-result__meta">{result.sectionLabel} · {result.meta.evidenceMix.map((item) => item[0].toUpperCase() + item.slice(1)).join(' · ')}</span>
                <span className="search-result__fragment">{result.fragment}</span>
              </Link>
            ))
          ) : (
            <div className="search-no-results"><strong>No page matches “{query}”.</strong><br />Try System map or a broader term.</div>
          )}
        </div>
      </div>
    </dialog>
  )
}
