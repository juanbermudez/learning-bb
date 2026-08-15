import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'orientation-system-map',
  route: '/orientation/system-map',
  section: 'orientation',
  navTitle: 'The whole BB system',
  title: 'The whole BB system',
  summary:
    'Use this map to place the app, server, event database, host daemon, provider runtime, workspace and thread storage, plugins, and Connect. Each box has a different owner. Solid boundaries are source-observed; the provider internals remain Unknown, so the map stops at the runtime handoff instead of guessing what happens inside a model adapter.',
  readingOrder: 2,
  readingMinutes: 3,
  headings: [
    { id: 'control-and-policy', title: 'Control begins in the browser or app' },
    { id: 'owners-and-storage', title: 'The server, database, and daemon have different jobs' },
    { id: 'extensions-and-connect', title: 'Plugins and Connect extend the boundary' },
  ],
  keywords: ['system map', 'server', 'daemon', 'event database', 'storage', 'plugins', 'connect'],
  searchTerms: ['architecture overview', 'where work runs', 'machine', 'host', 'components'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['home', 'runtime-runtime-boundaries', 'operations-remote-access-machines'],
})
