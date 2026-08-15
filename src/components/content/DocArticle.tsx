import type { ReactNode } from 'react'
import type { PageMeta } from '../../content/schema'
import { PageHeader } from './PageHeader'
import type { SectionDefinition } from '../../app/navigation'

export function DocArticle({ meta, section, children }: { meta: PageMeta; section?: SectionDefinition; children: ReactNode }) {
  return <article className="doc-article"><PageHeader meta={meta} section={section} /><div className="doc-article__body">{children}</div></article>
}
