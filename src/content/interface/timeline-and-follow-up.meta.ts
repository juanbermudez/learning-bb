import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'interface-timeline-and-follow-up',
  route: '/interface/timeline-and-follow-up',
  section: 'interface',
  navTitle: 'Timeline and follow-up',
  title: 'Timeline and follow-up',
  summary: 'A BB thread is an active control surface, not merely a transcript. Timeline rows expose work, files, commands, questions, approvals, and lifecycle states; the lower prompt area lets you answer, queue, stop, or continue. Host status and queue semantics remain authoritative even when the visible timeline is loading, optimistic, stale, or read-only.',
  readingOrder: 11,
  readingMinutes: 3,
  headings: [
    { id: 'rows-are-state', title: 'Rows are state, not just messages' },
    { id: 'questions-and-approvals', title: 'Questions and approvals pause the control surface' },
    { id: 'continue-or-stop', title: 'Continue, queue, or stop' },
  ],
  keywords: ['timeline', 'event row', 'question', 'approval', 'queue', 'stop', 'follow-up', 'thread header'],
  searchTerms: ['read a thread', 'continue work', 'pending question', 'queued prompt', 'stop run', 'transcript'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'runtime-events-and-persistence',
    'interface-start-a-thread',
    'interface-panels-files-environment',
  ],
})
