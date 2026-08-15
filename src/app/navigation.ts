import type { ContentSection, PageMeta } from '../content/schema'
import { contentRegistry } from '../content/registry'

export interface SectionDefinition {
  id: ContentSection
  label: string
  shortLabel: string
  description: string
  firstRoute: string
}

export const SECTION_DEFINITIONS: readonly SectionDefinition[] = [
  { id: 'orientation', label: 'Orientation', shortLabel: 'Start', description: 'Find the system boundary.', firstRoute: '/orientation/system-map' },
  { id: 'runtime', label: 'Runtime', shortLabel: 'Run', description: 'Follow a request through execution.', firstRoute: '/runtime/send-queue-start' },
  { id: 'interface', label: 'Interface', shortLabel: 'UI', description: 'Read the app surface.', firstRoute: '/interface/shell-and-navigation' },
  { id: 'plugins', label: 'Plugins', shortLabel: 'Add', description: 'See what extensions can add.', firstRoute: '/plugins/model-and-lifecycle' },
  { id: 'foundations', label: 'Agent foundations', shortLabel: 'Agent', description: 'Separate context and tools.', firstRoute: '/foundations/rules-skills-tools' },
  { id: 'operations', label: 'Operations', shortLabel: 'Ops', description: 'Trace machines and trust.', firstRoute: '/operations/remote-access-machines' },
  { id: 'blueprints', label: 'Proposed blueprints', shortLabel: 'Future', description: 'Inspect bounded proposals.', firstRoute: '/blueprints/interaction-agent' },
]

export const SNAPSHOT_LABEL = 'BB fork feature/bots · 3a66656a0 + local changes · observed 2026-08-15'

export function headingRoute(pathname: string, headingId: string): string {
  return `${pathname}?${new URLSearchParams({ heading: headingId }).toString()}`
}

export function sectionForPath(pathname: string): SectionDefinition | undefined {
  if (pathname === '/') return SECTION_DEFINITIONS.find((section) => section.id === 'orientation')
  const match = SECTION_DEFINITIONS.find((section) => pathname.startsWith(`/${section.id}`))
  return match
}

export function pagesForSection(section: ContentSection): readonly PageMeta[] {
  return contentRegistry
    .filter((entry) => entry.meta.section === section)
    .map((entry) => entry.meta)
}

export function navigationNeighbors(meta: PageMeta) {
  const index = contentRegistry.findIndex((entry) => entry.meta.id === meta.id)
  return {
    previous: index > 0 ? contentRegistry[index - 1]?.meta : undefined,
    next: index >= 0 ? contentRegistry[index + 1]?.meta : undefined,
  }
}
