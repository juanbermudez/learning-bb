import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'home',
  route: '/',
  section: 'orientation',
  navTitle: 'Home',
  title: 'What is BB?',
  summary:
    'BB is a local-first control surface for directing agent work. The browser or desktop app collects intent; the server applies policy and stores state; a host daemon runs work near a workspace and provider process. This independent guide starts with that map, then traces Send, explains the visible app, and marks every statement as Observed, Inference, Proposed, or Unknown.',
  readingOrder: 1,
  readingMinutes: 3,
  headings: [
    { id: 'bb-is-local-first', title: 'BB is a local-first control surface' },
    { id: 'choose-your-path', title: 'Choose your first question' },
    { id: 'snapshot-notice', title: 'This guide is an independent snapshot' },
  ],
  keywords: ['bb', 'local-first', 'browser', 'server', 'daemon', 'provider'],
  searchTerms: ['start here', 'what is bb', 'system overview', 'beginner map'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'orientation-system-map',
    'runtime-send-queue-start',
    'interface-shell-and-navigation',
  ],
})
