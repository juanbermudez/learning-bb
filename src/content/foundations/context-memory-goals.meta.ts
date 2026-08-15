import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'foundations-context-memory-goals',
  route: '/foundations/context-memory-goals',
  section: 'foundations',
  navTitle: 'Context, memory, goals',
  title: 'Context, memory, and goals',
  summary:
    'A provider turn has current inputs, while prompt history and BB memory are durable recall systems. Goals are durable thread records, and a runtime waiter only waits for an event that confirms a change. Keeping these lifetimes separate prevents recall from being mistaken for prompt context.',
  readingOrder: 20,
  readingMinutes: 4,
  headings: [
    { id: 'turn-context', title: 'Current context is what reaches this turn' },
    { id: 'durable-recall', title: 'History and memory are durable recall' },
    { id: 'goals-and-waiters', title: 'Goals are records, not waiters' },
    { id: 'restart-boundary', title: 'Restart rebuilds live state' },
  ],
  keywords: [
    'context',
    'agent-only',
    'prompt history',
    'BB memory',
    'provider-native memory',
    'goals',
    'waiter',
    'durable state',
  ],
  searchTerms: [
    'memory versus context',
    'saved history',
    'goal state',
    'what survives restart',
    'recall',
  ],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-agent-input', 'runtime-events-and-persistence', 'foundations-compaction-and-windowing'],
})
