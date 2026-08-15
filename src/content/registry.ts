import type { ComponentType } from 'react'
import type { ContentSection, PageMeta, SourceRecord } from './schema'

export interface PageModule {
  default: ComponentType
  meta?: PageMeta
  sources?: readonly SourceRecord[]
}

export interface ContentEntry {
  meta: PageMeta
  load: () => Promise<PageModule>
}

interface ExpectedPage {
  id: string
  route: string
  section: ContentSection
  readingOrder: number
}

export const EXPECTED_PAGES: readonly ExpectedPage[] = [
  { id: 'home', route: '/', section: 'orientation', readingOrder: 1 },
  { id: 'orientation-system-map', route: '/orientation/system-map', section: 'orientation', readingOrder: 2 },
  { id: 'orientation-source-and-fork', route: '/orientation/source-and-fork', section: 'orientation', readingOrder: 3 },
  { id: 'runtime-send-queue-start', route: '/runtime/send-queue-start', section: 'runtime', readingOrder: 4 },
  { id: 'runtime-agent-input', route: '/runtime/agent-input', section: 'runtime', readingOrder: 5 },
  { id: 'runtime-runtime-boundaries', route: '/runtime/runtime-boundaries', section: 'runtime', readingOrder: 6 },
  { id: 'runtime-events-and-persistence', route: '/runtime/events-and-persistence', section: 'runtime', readingOrder: 7 },
  { id: 'runtime-failure-restart-compaction', route: '/runtime/failure-restart-compaction', section: 'runtime', readingOrder: 8 },
  { id: 'interface-shell-and-navigation', route: '/interface/shell-and-navigation', section: 'interface', readingOrder: 9 },
  { id: 'interface-start-a-thread', route: '/interface/start-a-thread', section: 'interface', readingOrder: 10 },
  { id: 'interface-timeline-and-follow-up', route: '/interface/timeline-and-follow-up', section: 'interface', readingOrder: 11 },
  { id: 'interface-panels-files-environment', route: '/interface/panels-files-environment', section: 'interface', readingOrder: 12 },
  { id: 'interface-settings-and-extensions', route: '/interface/settings-and-extensions', section: 'interface', readingOrder: 13 },
  { id: 'interface-responsive-and-electron', route: '/interface/responsive-and-electron', section: 'interface', readingOrder: 14 },
  { id: 'plugins-model-and-lifecycle', route: '/plugins/model-and-lifecycle', section: 'plugins', readingOrder: 15 },
  { id: 'plugins-backend-powers', route: '/plugins/backend-powers', section: 'plugins', readingOrder: 16 },
  { id: 'plugins-ui-surface-atlas', route: '/plugins/ui-surface-atlas', section: 'plugins', readingOrder: 17 },
  { id: 'plugins-compatibility-trust-fallbacks', route: '/plugins/compatibility-trust-fallbacks', section: 'plugins', readingOrder: 18 },
  { id: 'foundations-rules-skills-tools', route: '/foundations/rules-skills-tools', section: 'foundations', readingOrder: 19 },
  { id: 'foundations-context-memory-goals', route: '/foundations/context-memory-goals', section: 'foundations', readingOrder: 20 },
  { id: 'foundations-compaction-and-windowing', route: '/foundations/compaction-and-windowing', section: 'foundations', readingOrder: 21 },
  { id: 'operations-remote-access-machines', route: '/operations/remote-access-machines', section: 'operations', readingOrder: 22 },
  { id: 'operations-self-hosting-security', route: '/operations/self-hosting-security', section: 'operations', readingOrder: 23 },
  { id: 'blueprints-interaction-agent', route: '/blueprints/interaction-agent', section: 'blueprints', readingOrder: 24 },
  { id: 'blueprints-multitenancy-sync', route: '/blueprints/multitenancy-sync', section: 'blueprints', readingOrder: 25 },
  { id: 'blueprints-ui-library-navigation', route: '/blueprints/ui-library-navigation', section: 'blueprints', readingOrder: 26 },
  { id: 'blueprints-react-native-companion', route: '/blueprints/react-native-companion', section: 'blueprints', readingOrder: 27 },
  { id: 'blueprints-connector-registry', route: '/blueprints/connector-registry', section: 'blueprints', readingOrder: 28 },
]

const metaModules = import.meta.glob<{ default: PageMeta }>('./**/*.meta.ts', { eager: true })
const pageModules = import.meta.glob<PageModule>('./**/*.page.tsx')
// This glob remains lazy: its keys validate triplet completeness without making
// source ledgers part of the eager shell metadata payload.
const sourceModules = import.meta.glob('./**/*.sources.json')

function keyStem(moduleKey: string): string {
  return moduleKey.replace(/^\.\//, '').replace(/\.(?:meta\.ts|page\.tsx|sources\.json)$/, '')
}

function moduleStem(expected: ExpectedPage): string {
  const routeStem = expected.route === '/' ? 'orientation/home' : expected.route.slice(1)
  return expected.section === 'blueprints' ? `${routeStem}/${expected.route.split('/').at(-1)}` : routeStem
}

function assertUnique(values: readonly (string | number)[], label: string, errors: string[]) {
  const seen = new Set<string | number>()
  for (const value of values) {
    if (seen.has(value)) errors.push(`duplicate ${label}: ${String(value)}`)
    seen.add(value)
  }
}

function buildRegistry(): readonly ContentEntry[] {
  const errors: string[] = []
  const metaByStem = new Map(Object.entries(metaModules).map(([key, module]) => [keyStem(key), module.default]))
  const pageByStem = new Map(Object.entries(pageModules).map(([key, load]) => [keyStem(key), load]))
  const sourceStems = new Set(Object.keys(sourceModules).map(keyStem))
  const allStems = new Set([...metaByStem.keys(), ...pageByStem.keys(), ...sourceStems])

  for (const stem of allStems) {
    if (!metaByStem.has(stem)) errors.push(`${stem}: missing .meta.ts`)
    if (!pageByStem.has(stem)) errors.push(`${stem}: missing .page.tsx`)
    if (!sourceStems.has(stem)) errors.push(`${stem}: missing .sources.json`)
  }
  if (allStems.size !== EXPECTED_PAGES.length) errors.push(`expected 28 complete page triplets, found ${allStems.size}`)

  const entries: ContentEntry[] = []
  for (const expected of EXPECTED_PAGES) {
    const stem = moduleStem(expected)
    const meta = metaByStem.get(stem)
    const loader = pageByStem.get(stem)
    if (!meta || !loader || !sourceStems.has(stem)) {
      errors.push(`${stem}: required inventory triplet is incomplete`)
      continue
    }
    for (const key of ['id', 'route', 'section', 'readingOrder'] as const) {
      if (meta[key] !== expected[key]) errors.push(`${stem}: ${key} must be ${String(expected[key])}`)
    }
    if (!meta.title.trim() || !meta.navTitle.trim() || !meta.summary.trim()) errors.push(`${stem}: title, navTitle, and summary are required`)
    if (new Set(meta.searchTerms.map((term) => term.trim().toLocaleLowerCase())).size < 3) errors.push(`${stem}: at least three unique Search synonyms are required`)
    const headingIds = meta.headings.map((heading) => heading.id)
    assertUnique(headingIds, `${stem} heading id`, errors)
    if (headingIds.some((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) errors.push(`${stem}: heading ids must be lowercase kebab-case`)
    entries.push({
      meta,
      load: async () => {
        const module = await loader()
        if (typeof module.default !== 'function') throw new Error(`${stem}: page module has no default component`)
        if (!module.meta || module.meta.id !== meta.id || module.meta.route !== meta.route) throw new Error(`${stem}: lazy page metadata does not match the eager record`)
        return module
      },
    })
  }

  assertUnique(entries.map((entry) => entry.meta.id), 'page id', errors)
  assertUnique(entries.map((entry) => entry.meta.route), 'route', errors)
  assertUnique(entries.map((entry) => entry.meta.readingOrder), 'reading order', errors)
  const ids = new Set(entries.map((entry) => entry.meta.id))
  for (const entry of entries) {
    for (const relatedId of entry.meta.relatedPageIds) {
      if (!ids.has(relatedId)) errors.push(`${entry.meta.id}: unknown related page id ${relatedId}`)
      if (relatedId === entry.meta.id) errors.push(`${entry.meta.id}: related page cannot reference itself`)
    }
  }
  if (errors.length) throw new Error(`Content registry validation failed:\n- ${errors.join('\n- ')}`)
  return Object.freeze(entries)
}

export const contentRegistry = buildRegistry()

export function pageForRoute(route: string): ContentEntry | undefined {
  return contentRegistry.find((entry) => entry.meta.route === route)
}

export function pageForId(id: string): ContentEntry | undefined {
  return contentRegistry.find((entry) => entry.meta.id === id)
}
