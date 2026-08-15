import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'runtime-failure-restart-compaction',
  route: '/runtime/failure-restart-compaction',
  section: 'runtime',
  navTitle: 'Failure and restart',
  title: 'Failure, restart, and compaction',
  summary:
    'Reconnect, daemon restart, provider exit, and compaction affect different state. Server rows, prompt history, and thread-storage files are durable inputs; runtime entries, provider processes, and pending event-sink items are shorter-lived. Manual provider compaction changes provider conversation state, while timeline summary compaction only changes a read projection. Provider recovery details remain explicitly bounded.',
  readingOrder: 8,
  readingMinutes: 4,
  headings: [
    { id: 'reconnect', title: 'Reconnect and restart take different paths' },
    { id: 'survival', title: 'Durable records outlive live process state' },
    { id: 'provider-exit', title: 'A provider exit becomes a failure event' },
    { id: 'compaction', title: 'Provider compaction is not timeline windowing' },
  ],
  keywords: ['restart', 'reconnect', 'provider exit', 'compaction', 'timeline window', 'resume'],
  searchTerms: ['what survives restart', 'lost events', 'crash', 'compact context', 'display summary', 'recover thread'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-events-and-persistence', 'runtime-runtime-boundaries', 'foundations-compaction-and-windowing'],
})
