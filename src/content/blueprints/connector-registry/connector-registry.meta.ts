import { definePageMeta } from '../../schema'

export default definePageMeta({
  id: 'blueprints-connector-registry',
  route: '/blueprints/connector-registry',
  section: 'blueprints',
  navTitle: 'Connector registry',
  title: 'Connector registry',
  summary: 'A Proposed connector registry would separate service metadata from accounts, grants, credentials, sync, webhooks, and execution. BB already exposes plugin auth modes, secret settings, background work, GitHub’s cache pattern, in-process runtime loading, and Better Auth account rows. Those are planning seams, not a registry, OAuth broker, token manager, or isolation boundary.',
  readingOrder: 28,
  readingMinutes: 4,
  headings: [
    { id: 'observed-current-seams', title: 'Observed current seams' },
    { id: 'explicit-gap', title: 'The explicit gap' },
    { id: 'proposed-smallest-path', title: 'Proposed smallest path' },
    { id: 'risks-unknowns-non-goals', title: 'Risks, Unknowns, and non-goals' },
  ],
  keywords: ['connector registry', 'OAuth', 'grants', 'webhooks', 'token manager', 'plugins'],
  searchTerms: ['integrations', 'SaaS accounts', 'refresh tokens', 'sync jobs', 'executor'],
  evidenceMix: ['observed', 'inference', 'proposed', 'unknown'],
  relatedPageIds: ['plugins-backend-powers', 'plugins-compatibility-trust-fallbacks', 'operations-remote-access-machines'],
})
