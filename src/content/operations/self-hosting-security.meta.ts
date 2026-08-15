import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'operations-self-hosting-security',
  route: '/operations/self-hosting-security',
  section: 'operations',
  navTitle: 'Self-hosting and security',
  title: 'Self-hosting and security boundaries',
  summary:
    'Self-hosting starts with a loopback listener and a clear trust boundary, not a promise of production readiness. Origin checks reduce browser cross-site requests but are not identity authentication. This page explains the 0.0.0.0 warning, private-network alternative, configurable Connect seams, update limits, and the accepted threat table without inventing an operations runbook.',
  readingOrder: 23,
  readingMinutes: 4,
  headings: [
    { id: 'start-with-loopback', title: 'Start with the loopback boundary' },
    { id: 'what-self-hosting-means', title: 'What self-hosting does and does not mean' },
    { id: 'read-the-threat-table', title: 'Read the threat table' },
    { id: 'what-updates-prove', title: 'What update checks do not prove' },
  ],
  keywords: ['self-hosting', 'security', 'loopback', 'origin guard', 'threat model'],
  searchTerms: ['0.0.0.0 warning', 'CSRF versus authentication', 'private network', 'signed updates'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['operations-remote-access-machines', 'orientation-system-map'],
})
