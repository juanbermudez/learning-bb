import { useState } from 'react'
import type { SourceRecord } from '../../content/schema'
import { EvidenceBadge } from './EvidenceBadge'

function publicLabel(source: SourceRecord) {
  if (source.type !== 'bb-source') return source.public?.status === 'verified' ? 'Verified public source' : 'Reference snapshot'
  return source.public.status === 'verified' ? 'Verified public source' : 'Local snapshot only'
}

export function SourceCard({ source }: { source: SourceRecord }) {
  const [copied, setCopied] = useState(false)
  const path = source.path ?? 'External reference'
  const lineWindow = source.lineStart && source.lineEnd ? `L${source.lineStart}–${source.lineEnd}` : 'Snapshot'
  const copyValue = `${path}${source.symbol ? ` · ${source.symbol}` : ''}${source.lineStart ? ` · ${lineWindow}` : ''}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(copyValue); setCopied(true); window.setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }
  const publicState = source.public
  return (
    <article className="source-card" id={`source-${source.id}`}>
      <div className="source-card__top"><EvidenceBadge label={source.label} /><span className="text-meta">{publicLabel(source)}</span></div>
      <div className="source-card__path" title={path}>{path}</div>
      <div className="source-card__symbol">{source.symbol ?? 'Reference material'}{source.lineStart ? ` · ${lineWindow}` : ''}</div>
      <p className="source-card__statement">{source.statement}</p>
      <div className="source-card__bottom"><span className="text-meta">{source.snapshot ? `${source.snapshot.branch} · ${source.snapshot.commit} · ${source.snapshot.observedAt}` : ('retrievedAt' in source ? source.retrievedAt ?? 'Snapshot reference' : 'Snapshot reference')}</span><div className="source-card__actions"><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy citation'}</button>{publicState?.status === 'verified' && publicState.url ? <a href={publicState.url} target="_blank" rel="noreferrer">Open source</a> : null}</div></div>
      <div className="copy-live" aria-live="polite">{copied ? 'Citation copied.' : ''}</div>
    </article>
  )
}
