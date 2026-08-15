import { useEffect, useState } from 'react'
import type { SourceRecord } from '../../content/schema'
import { SourceCard } from './SourceCard'

export function SourceDisclosure({ sources }: { sources: readonly SourceRecord[] }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (window.location.hash.startsWith('#source-')) setOpen(true)
  }, [])
  if (!sources.length) return null
  return <details className="sources-disclosure" open={open} onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}><summary>Sources and snapshot boundaries ({sources.length})</summary><div className="sources-disclosure__list">{sources.map((source) => <SourceCard key={source.id} source={source} />)}</div></details>
}
