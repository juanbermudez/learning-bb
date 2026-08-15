import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { headingRoute } from '../../app/navigation'

export function PageSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const location = useLocation()
  return <section id={id} className="page-section" aria-labelledby={`${id}-title`}><div className="page-section__heading"><h2 id={`${id}-title`}>{title}</h2><Link to={headingRoute(location.pathname, id)} aria-label={`Link to ${title}`}>#</Link></div>{children}</section>
}
