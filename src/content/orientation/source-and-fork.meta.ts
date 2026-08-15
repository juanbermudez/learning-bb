import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'orientation-source-and-fork',
  route: '/orientation/source-and-fork',
  section: 'orientation',
  navTitle: 'Source snapshot and maintained fork',
  title: 'Source snapshot and maintained fork',
  summary:
    'Learn how to read this site’s evidence contract. Observed, Inference, Proposed, and Unknown mean different things; a dirty snapshot can be cited without a fake public link; and an upstream merge creates a freshness boundary. The maintained fork is a source baseline, not official BB documentation, and a protocol number changes only when the server-to-daemon wire contract changes.',
  readingOrder: 3,
  readingMinutes: 3,
  headings: [
    { id: 'four-labels', title: 'Four labels answer four different questions' },
    { id: 'dirty-snapshot', title: 'A dirty snapshot still needs an honest fallback' },
    { id: 'freshness-after-merges', title: 'An upstream merge starts a freshness check' },
    { id: 'independent-posture', title: 'The maintained fork is not official documentation' },
  ],
  keywords: ['source snapshot', 'maintained fork', 'evidence', 'observed', 'inference', 'proposed', 'unknown', 'merge'],
  searchTerms: ['how to trust this', 'citations', 'dirty checkout', 'public link', 'upstream freshness', 'unofficial'],
  evidenceMix: ['observed', 'inference', 'proposed', 'unknown'],
  relatedPageIds: ['home', 'orientation-system-map', 'blueprints-multitenancy-sync'],
})
