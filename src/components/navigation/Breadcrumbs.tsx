import { Link } from 'react-router-dom'
import type { PageMeta } from '../../content/schema'
import type { SectionDefinition } from '../../app/navigation'

export function Breadcrumbs({ meta, section }: { meta?: PageMeta; section?: SectionDefinition }) {
  if (!meta || meta.route === '/') return null
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to={section?.firstRoute ?? '/'}>{section?.label ?? 'Documentation'}</Link>
      <span className="breadcrumbs__separator" aria-hidden="true">/</span>
      <span aria-current="page">{meta?.navTitle ?? 'Not found'}</span>
    </nav>
  )
}
