import type { ReactNode } from 'react'

export function Limits({ children }: { children: ReactNode }) { return <aside className="limits"><div className="limits__title">What this does not prove</div>{Array.isArray(children) ? <ul>{children}</ul> : <div>{children}</div>}</aside> }
