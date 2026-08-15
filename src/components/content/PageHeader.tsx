import type { PageMeta } from '../../content/schema'
import type { SectionDefinition } from '../../app/navigation'
import { SNAPSHOT_LABEL } from '../../app/navigation'
import { Breadcrumbs } from '../navigation/Breadcrumbs'
import { EvidenceBadge } from './EvidenceBadge'

export function PageHeader({ meta, section }: { meta: PageMeta; section?: SectionDefinition }) {
  return (
    <header className="main-header">
      <Breadcrumbs meta={meta} section={section} />
      <div className="page-eyebrow"><span>{section?.label ?? meta.section}</span><span aria-hidden="true">·</span><span>Learning BB</span></div>
      <h1 tabIndex={-1} data-route-heading>{meta.title}</h1>
      <p className="page-summary">{meta.summary}</p>
      <div className="page-meta-row">
        <span>{meta.readingMinutes} min read</span>
        <span aria-hidden="true">·</span>
        <span className="page-meta-row__mix" aria-label={`Evidence mix: ${meta.evidenceMix.join(', ')}`}>
          {meta.evidenceMix.map((label) => <EvidenceBadge key={label} label={label} />)}
        </span>
        <span aria-hidden="true">·</span>
        <span title={SNAPSHOT_LABEL}>Snapshot: 2026-08-15</span>
      </div>
    </header>
  )
}
