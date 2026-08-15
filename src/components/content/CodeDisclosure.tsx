import { useState } from 'react'

export function CodeDisclosure({ summary = 'Read the source shape', code }: { summary?: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) } }
  return <details className="code-disclosure"><summary>{summary}</summary><pre>{code}</pre><button type="button" className="button" onClick={copy}>{copied ? 'Copied' : 'Copy excerpt'}</button><div className="copy-live" aria-live="polite">{copied ? 'Excerpt copied.' : ''}</div></details>
}
