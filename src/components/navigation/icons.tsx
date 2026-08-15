import type { ReactNode } from 'react'

export function RailIcon({ kind }: { kind: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  let shape: ReactNode
  switch (kind) {
    case 'runtime': shape = <><path {...common} d="M5 12h4l2-7 2 14 2-7h4" /></>
      break
    case 'interface': shape = <><rect {...common} x="4" y="5" width="16" height="14" rx="2" /><path {...common} d="M4 9h16M8 13h3M8 16h7" /></>
      break
    case 'plugins': shape = <><path {...common} d="M8 4v4H5a2 2 0 0 0 0 4h3v4h4v-3a2 2 0 1 1 4 0v3h3v-4h-3a2 2 0 1 1 0-4h3V4h-4v3a2 2 0 1 1-4 0V4Z" /></>
      break
    case 'foundations': shape = <><circle {...common} cx="12" cy="12" r="7" /><path {...common} d="M12 5v14M5 12h14" /></>
      break
    case 'operations': shape = <><path {...common} d="M6 18h12M8 15h8M10 12h4M12 4v8M9 7l3-3 3 3" /></>
      break
    case 'blueprints': shape = <><path {...common} d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></>
      break
    default: shape = <><circle {...common} cx="12" cy="12" r="7" /><circle {...common} cx="12" cy="12" r="2" /></>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{shape}</svg>
}

export function MenuIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg> }
export function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle fill="none" stroke="currentColor" strokeWidth="1.8" cx="10.8" cy="10.8" r="6.3" /><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="m16 16 4 4" /></svg> }
export function CloseIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg> }
