import { describe, expect, it } from 'vitest'
import { navigationNeighbors } from '../app/navigation'
import { searchPages } from '../components/search/search'
import { contentRegistry, EXPECTED_PAGES, pageForId, pageForRoute } from './registry'

describe('final content registry', () => {
  it('contains the exact complete 28-page inventory and canonical neighbors', () => {
    expect(contentRegistry.map(({ meta }) => ({ id: meta.id, route: meta.route, section: meta.section, readingOrder: meta.readingOrder }))).toEqual(EXPECTED_PAGES)
    for (const [index, entry] of contentRegistry.entries()) {
      expect(pageForId(entry.meta.id)).toBe(entry)
      expect(pageForRoute(entry.meta.route)).toBe(entry)
      const neighbors = navigationNeighbors(entry.meta)
      expect(neighbors.previous?.id).toBe(index === 0 ? undefined : contentRegistry[index - 1]?.meta.id)
      expect(neighbors.next?.id).toBe(index === contentRegistry.length - 1 ? undefined : contentRegistry[index + 1]?.meta.id)
    }
  })

  it('lazy-loads every page with matching metadata', async () => {
    for (const entry of contentRegistry) {
      const module = await entry.load()
      expect(module.meta).toBe(entry.meta)
      expect(typeof module.default).toBe('function')
    }
  })

  it('finds every page by exact title and its first three domain synonyms', () => {
    const pages = contentRegistry.map((entry) => entry.meta)
    for (const meta of pages) {
      for (const query of [meta.title, ...meta.searchTerms.slice(0, 3)]) {
        expect(searchPages(pages, query).some((result) => result.meta.id === meta.id), `${meta.id}: ${query}`).toBe(true)
      }
    }
  })
})
