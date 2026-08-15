import { definePageMeta } from '../../schema'

export default definePageMeta({
  id: 'blueprints-interaction-agent',
  route: '/blueprints/interaction-agent',
  section: 'blueprints',
  navTitle: 'Interaction Agent and voice',
  title: 'Interaction Agent and voice',
  summary: 'A Proposed first-party plugin could give BB a persistent interaction surface while reusing hidden threads, queues, lifecycle events, and batch transcription. This page separates those Observed seams from the missing dock, context bus, dedicated thread, streaming voice, text-to-speech, and global push-to-talk contracts. It is a planning boundary, not a claim that an assistant exists.',
  readingOrder: 24,
  readingMinutes: 4,
  headings: [
    { id: 'observed-current-seams', title: 'Observed current seams' },
    { id: 'explicit-gap', title: 'The explicit gap' },
    { id: 'proposed-smallest-path', title: 'Proposed smallest path' },
    { id: 'risks-unknowns-non-goals', title: 'Risks, Unknowns, and non-goals' },
  ],
  keywords: ['interaction agent', 'voice', 'side chat', 'queue', 'context bus'],
  searchTerms: ['assistant dock', 'push to talk', 'text to speech', 'hidden thread'],
  evidenceMix: ['observed', 'proposed', 'unknown'],
  relatedPageIds: ['runtime-runtime-boundaries', 'runtime-send-queue-start', 'plugins-model-and-lifecycle'],
})
