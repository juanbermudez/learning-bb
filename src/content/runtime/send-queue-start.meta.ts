import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'runtime-send-queue-start',
  route: '/runtime/send-queue-start',
  section: 'runtime',
  navTitle: 'Press Send',
  title: 'What happens when you press Send',
  summary:
    'Press Send is a short chain of decisions, not a direct call from the browser to a model. The app may show an optimistic row, the server may save a queued message, or it may persist client/turn/requested and dispatch a host command. A provider session id decides whether the next command starts or submits work.',
  readingOrder: 4,
  readingMinutes: 4,
  headings: [
    { id: 'request', title: 'The request starts in the composer' },
    { id: 'queue', title: 'An active turn can queue the message' },
    { id: 'command-choice', title: 'Start, submit, and steer are different choices' },
    { id: 'durable-handoff', title: 'The server records intent before provider output' },
  ],
  keywords: ['send', 'queue', 'thread.start', 'turn.submit', 'client/turn/requested'],
  searchTerms: ['first message', 'optimistic message', 'follow-up', 'steer', 'submit prompt'],
  evidenceMix: ['observed', 'inference'],
  relatedPageIds: ['runtime-agent-input', 'runtime-runtime-boundaries'],
})
