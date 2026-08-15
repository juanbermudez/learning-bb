import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'foundations-compaction-and-windowing',
  route: '/foundations/compaction-and-windowing',
  section: 'foundations',
  navTitle: 'Compaction and windowing',
  title: 'Compaction and windowing',
  summary:
    'Provider context usage, provider compaction, server timeline windows, and display summaries answer different questions. This page follows each boundary from its source event or command to its visible result, then separates durable event history from process state after restart. The result is a vocabulary for reading usage, compaction, pagination, and recovery without merging their meanings.',
  readingOrder: 21,
  readingMinutes: 3,
  headings: [
    { id: 'three-windows', title: 'Three windows answer different questions' },
    { id: 'provider-compaction', title: 'Manual compaction is a provider action' },
    { id: 'display-summary', title: 'Read-side summaries optimize display' },
    { id: 'restart-persistence', title: 'Restart preserves records, not every process detail' },
  ],
  keywords: [
    'provider context usage',
    'compaction',
    'timeline window',
    'event budget',
    'display summary',
    'restart',
    'persistence',
  ],
  searchTerms: [
    'context window versus timeline',
    'compact thread',
    'summary rows',
    'token usage',
    'what survives restart',
  ],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-failure-restart-compaction', 'runtime-events-and-persistence', 'foundations-context-memory-goals'],
})
