import { Link } from 'react-router-dom'
import type { PageMeta } from '../../content/schema'
import type { SectionDefinition } from '../../app/navigation'
import { SNAPSHOT_LABEL } from '../../app/navigation'
import { ThemeControl } from '../theme/ThemeControl'

export function PageRail({ section, pages, activeRoute }: { section?: SectionDefinition; pages: readonly PageMeta[]; activeRoute: string }) {
  return (
    <aside className="page-rail" aria-label="Pages in this section">
      <div className="page-rail__heading">
        <div className="page-rail__eyebrow">Learning BB</div>
        <div className="page-rail__title">{section?.label ?? 'Documentation'}</div>
      </div>
      <nav className="page-rail__list" aria-label={section ? `${section.label} pages` : 'Pages'}>
        {pages.length > 0 ? pages.map((page) => (
          <Link key={page.id} to={page.route} aria-current={activeRoute === page.route ? 'page' : undefined}>
            {page.navTitle}
          </Link>
        )) : <div className="page-rail__empty">Authored pages will appear here when the content registry is integrated.</div>}
      </nav>
      <div className="snapshot-card">
        <strong>Source snapshot</strong>
        {SNAPSHOT_LABEL}
      </div>
      <div className="page-rail__theme"><ThemeControl /></div>
    </aside>
  )
}
