import { describe, expect, it } from 'vitest'
import { searchPages } from './search'
import type { PageMeta } from '../../content/schema'

const pages: PageMeta[] = [
  { id: 'runtime-send', route: '/runtime/send', section: 'runtime', navTitle: 'Press Send', title: 'What happens when you press Send', summary: 'Trace the request.', readingOrder: 1, readingMinutes: 3, headings: [{ id: 'queue', title: 'The queue branch' }], keywords: ['send', 'queue'], searchTerms: ['first message'], evidenceMix: ['observed'], relatedPageIds: [] },
  { id: 'plugin-model', route: '/plugins/model', section: 'plugins', navTitle: 'Plugin model', title: 'Plugin lifecycle and trust', summary: 'How extensions load.', readingOrder: 2, readingMinutes: 3, headings: [{ id: 'install', title: 'Install a plugin' }], keywords: ['extension'], searchTerms: ['add-on'], evidenceMix: ['observed', 'unknown'], relatedPageIds: [] },
]

describe('local search ranking', () => {
  it('ranks an exact title before heading and keyword matches', () => {
    const results = searchPages(pages, 'What happens when you press Send')
    expect(results[0]?.meta.id).toBe('runtime-send')
    expect(results[0]?.rank).toBe(100)
  })

  it('matches beginner synonyms without persisting the query', () => {
    expect(searchPages(pages, 'add-on')[0]?.meta.id).toBe('plugin-model')
    expect(searchPages(pages, '')).toEqual([])
  })
})
