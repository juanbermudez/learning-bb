import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'plugins-compatibility-trust-fallbacks',
  route: '/plugins/compatibility-trust-fallbacks',
  section: 'plugins',
  navTitle: 'Compatibility, trust, and fallbacks',
  title: 'What compatibility and failure containment really mean',
  summary:
    'Plugin compatibility is a set of gates, not one version string. The observed running SDK is 0.4.4 with same-major floor behavior, while prebuilt artifacts and app bundles have their own checks. The page also maps full-trust CSS and content-script reach, generation cleanup, native fallbacks, and the unresolved `registerThreadAction` name without presenting it as an available API.',
  readingOrder: 18,
  readingMinutes: 4,
  headings: [
    { id: 'compatibility-gates', title: 'Compatibility has more than one gate' },
    { id: 'trust-and-reach', title: 'Trust reaches further than the mount' },
    { id: 'failure-containment', title: 'Failures preserve a usable host' },
  ],
  keywords: ['SDK compatibility', 'full trust', 'CSS', 'content script', 'fallback', 'disposal'],
  searchTerms: ['plugin version mismatch', 'plugin sandbox', 'CSS scope', 'registerThreadAction'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'plugins-model-and-lifecycle',
    'plugins-ui-surface-atlas',
    'operations-self-hosting-security',
  ],
})
