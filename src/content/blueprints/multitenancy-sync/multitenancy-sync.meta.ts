import { definePageMeta } from '../../schema'

export default definePageMeta({
  id: 'blueprints-multitenancy-sync',
  route: '/blueprints/multitenancy-sync',
  section: 'blueprints',
  navTitle: 'Multitenancy and synced threads',
  title: 'Multitenancy and synced threads',
  summary: 'A Proposed sync layer would build on local SQLite event durability and Connect identity routing, then add organizations, grants, cloud mirroring, epochs, tombstones, and handoff rules. This page keeps protocol 119 and server-owned sequences Observed, marks exactly-once effect as an Inference, and leaves tenancy, conflict, retention, and actor authorization as explicit decisions before implementation.',
  readingOrder: 25,
  readingMinutes: 4,
  headings: [
    { id: 'observed-current-seams', title: 'Observed current seams' },
    { id: 'explicit-gap', title: 'The explicit gap' },
    { id: 'proposed-smallest-path', title: 'Proposed smallest path' },
    { id: 'risks-unknowns-non-goals', title: 'Risks, Unknowns, and non-goals' },
  ],
  keywords: ['multitenancy', 'thread sync', 'SQLite WAL', 'event sequence', 'Connect'],
  searchTerms: ['team threads', 'cloud mirror', 'organization', 'exactly once', 'handoff'],
  evidenceMix: ['observed', 'inference', 'proposed', 'unknown'],
  relatedPageIds: ['runtime-events-and-persistence', 'operations-remote-access-machines', 'runtime-failure-restart-compaction'],
})
