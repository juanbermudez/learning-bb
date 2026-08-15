import { definePageMeta } from '../../schema'

export default definePageMeta({
  id: 'blueprints-ui-library-navigation',
  route: '/blueprints/ui-library-navigation',
  section: 'blueprints',
  navTitle: 'UI library and navigation changes',
  title: 'UI library and navigation changes',
  summary: 'A Proposed beUI adapter could refine shared primitives, route motion, the bottom composer, palette mapping, and a user-curated Shortcuts section. The source snapshot instead shows a shared UI export seam, two hover transitions, core-owned routes, both icon families, thirteen plugin slots, and a separate nine-key thread shortcut feature. The distinction keeps visual direction from becoming a product claim.',
  readingOrder: 26,
  readingMinutes: 4,
  headings: [
    { id: 'observed-current-seams', title: 'Observed current seams' },
    { id: 'explicit-gap', title: 'The explicit gap' },
    { id: 'proposed-smallest-path', title: 'Proposed smallest path' },
    { id: 'risks-unknowns-non-goals', title: 'Risks, Unknowns, and non-goals' },
  ],
  keywords: ['beUI', 'navigation', 'motion', 'composer', 'Shortcuts', 'plugin slots'],
  searchTerms: ['design system', 'route transition', 'icon library', 'sidebar shortcuts'],
  evidenceMix: ['observed', 'proposed', 'unknown'],
  relatedPageIds: ['interface-shell-and-navigation', 'plugins-ui-surface-atlas', 'interface-start-a-thread'],
})
