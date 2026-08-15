import type { ReactNode } from 'react'
import type { PageMeta } from '../../content/schema'
import { PageHeader } from './PageHeader'
import { SECTION_DEFINITIONS, type SectionDefinition } from '../../app/navigation'

export function DocArticle({ meta, section, children }: { meta: PageMeta; section?: SectionDefinition; children: ReactNode }) {
  const resolvedSection = section ?? SECTION_DEFINITIONS.find((definition) => definition.id === meta.section)
  return <article className="doc-article"><PageHeader meta={meta} section={resolvedSection} /><div className="doc-article__body">{children}</div></article>
}
