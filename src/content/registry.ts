import type { ComponentType } from 'react'
import type { PageMeta, SourceRecord } from './schema'

export interface PageModule {
  default: ComponentType
  meta?: PageMeta
  sources?: readonly SourceRecord[]
}

export interface ContentEntry {
  meta: PageMeta
  load: () => Promise<PageModule>
}

/**
 * Empty, typed integration seam. Content workers own their adjacent triplets;
 * I01 replaces this convention-based map after all seven directories land.
 */
const metaModules = import.meta.glob<{ default: PageMeta }>('./**/*.meta.ts', {
  eager: true,
})
const pageModules = import.meta.glob<PageModule>('./**/*.page.tsx')

function pageKeyForMeta(metaKey: string): string {
  return metaKey.replace(/\.meta\.ts$/, '.page.tsx')
}

export const contentRegistry: readonly ContentEntry[] = Object.entries(metaModules)
  .map(([metaKey, module]) => {
    const pageKey = pageKeyForMeta(metaKey)
    const load = pageModules[pageKey]
    if (!load) return null
    return { meta: module.default, load }
  })
  .filter((entry): entry is ContentEntry => Boolean(entry))
  .sort((a, b) => a.meta.readingOrder - b.meta.readingOrder)

export function pageForRoute(route: string): ContentEntry | undefined {
  return contentRegistry.find((entry) => entry.meta.route === route)
}

export function pageForId(id: string): ContentEntry | undefined {
  return contentRegistry.find((entry) => entry.meta.id === id)
}
