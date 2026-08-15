import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'runtime-events-and-persistence',
  route: '/runtime/events-and-persistence',
  section: 'runtime',
  navTitle: 'Events and persistence',
  title: 'How events become the timeline',
  summary:
    'Provider events return through a daemon sink, cross an authenticated server ingress, and land in stored event rows with lifecycle effects. The app does not render the raw log directly: the server selects a bounded window and builds timeline and outline read models. WebSocket invalidation prompts delta or full queries, allowing optimistic rows to be repaired by the server projection.',
  readingOrder: 7,
  readingMinutes: 4,
  headings: [
    { id: 'event-ingress', title: 'The daemon delivers event envelopes' },
    { id: 'stored-effects', title: 'The server stores rows and applies effects' },
    { id: 'timeline-projection', title: 'The timeline is a bounded read projection' },
    { id: 'realtime-repair', title: 'WebSocket changes trigger cache repair' },
  ],
  keywords: ['provider events', 'event sink', 'stored rows', 'timeline projection', 'WebSocket', 'events-appended'],
  searchTerms: ['raw event log', 'timeline rows', 'live updates', 'realtime invalidation', 'optimistic repair', 'conversation outline'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-runtime-boundaries', 'runtime-failure-restart-compaction', 'interface-timeline-and-follow-up'],
})
