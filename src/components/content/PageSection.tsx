import type { ReactNode } from 'react'

export function PageSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className="page-section" aria-labelledby={`${id}-title`}><div className="page-section__heading"><h2 id={`${id}-title`}>{title}</h2><a href={`#${id}`} aria-label={`Link to ${title}`}>#</a></div>{children}</section>
}
