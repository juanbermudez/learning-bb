import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'plugins-model-and-lifecycle',
  route: '/plugins/model-and-lifecycle',
  section: 'plugins',
  navTitle: 'Mental model and lifecycle',
  title: 'How a BB plugin is loaded and retired',
  summary:
    'A BB plugin is an in-process TypeScript package with a server factory and an optional independently reconciled app bundle. This page follows install-source parsing, manifest and SDK checks, generation swaps, full-trust boundaries, and disposal. It explains why a failed reload can preserve the prior generation while a frontend failure stays contained, without implying sandboxing or direct control of providers.',
  readingOrder: 15,
  readingMinutes: 3,
  headings: [
    { id: 'install-gate', title: 'Install is a gated handoff' },
    { id: 'generation-swap', title: 'Reload swaps generations atomically' },
    { id: 'independent-disposal', title: 'Server and app disposal are coordinated' },
  ],
  keywords: ['plugin', 'manifest', 'SDK', 'generation', 'reload', 'disposal'],
  searchTerms: ['how plugins load', 'plugin restart', 'extension lifecycle', 'sandbox'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'plugins-backend-powers',
    'plugins-compatibility-trust-fallbacks',
    'interface-settings-and-extensions',
  ],
})
