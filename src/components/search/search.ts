import type { PageMeta } from '../../content/schema'

export interface SearchRecord {
  meta: PageMeta
  sectionLabel: string
  fragment: string
  rank: number
}

const sectionLabels: Record<string, string> = {
  orientation: 'Orientation', runtime: 'Runtime', interface: 'Interface', plugins: 'Plugins', foundations: 'Agent foundations', operations: 'Operations', blueprints: 'Proposed blueprints',
}

function normalized(value: string) { return value.trim().toLocaleLowerCase() }

export function searchPages(pages: readonly PageMeta[], query: string): SearchRecord[] {
  const needle = normalized(query)
  if (!needle) return []
  return pages.map((meta) => {
    const title = normalized(meta.title)
    const nav = normalized(meta.navTitle)
    const heading = meta.headings.find((item) => normalized(item.title).includes(needle))
    const keyword = meta.keywords.find((item) => normalized(item).includes(needle))
    const summaryMatch = normalized(meta.summary).includes(needle)
    const termMatch = meta.searchTerms.find((item) => normalized(item).includes(needle))
    let rank = 0
    let fragment = meta.summary
    if (title === needle || nav === needle) { rank = 100; fragment = meta.summary }
    else if (title.startsWith(needle) || nav.startsWith(needle)) { rank = 85; fragment = meta.summary }
    else if (heading) { rank = 70; fragment = heading.title }
    else if (keyword) { rank = 55; fragment = `Keyword: ${keyword}` }
    else if (summaryMatch || termMatch) { rank = 40; fragment = termMatch ?? meta.summary }
    return { meta, sectionLabel: sectionLabels[meta.section] ?? meta.section, fragment, rank }
  }).filter((result) => result.rank > 0).sort((a, b) => b.rank - a.rank || a.meta.readingOrder - b.meta.readingOrder).slice(0, 12)
}

export const SEARCH_INTENTS = ['How Send works', 'What plugins can add', 'Where work runs', 'How memory differs from context', 'Future blueprints'] as const
