import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'interface-start-a-thread',
  route: '/interface/start-a-thread',
  section: 'interface',
  navTitle: 'Start a thread',
  title: 'Home, composer, and execution controls',
  summary: 'The home route is a host-owned place to choose a project, shape execution, and write the first prompt. Provider, model, reasoning, permission, environment, worktree, branch, attachment, and mention controls are related but not interchangeable. Some choices disappear or become unavailable when the host, provider, source, or plugin state cannot support them.',
  readingOrder: 10,
  readingMinutes: 3,
  headings: [
    { id: 'empty-home', title: 'Home starts with a state, not a transcript' },
    { id: 'choices-before-send', title: 'Choose what runs and where' },
    { id: 'composer-and-availability', title: 'The composer gathers the request' },
  ],
  keywords: ['home', 'composer', 'provider', 'model', 'reasoning', 'permission', 'environment', 'worktree', 'branch'],
  searchTerms: ['new thread', 'start work', 'execution controls', 'host unavailable', 'attach file', 'mention'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'interface-shell-and-navigation',
    'interface-timeline-and-follow-up',
    'runtime-send-queue-start',
  ],
})
