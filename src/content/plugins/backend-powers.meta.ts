import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'plugins-backend-powers',
  route: '/plugins/backend-powers',
  section: 'plugins',
  navTitle: 'Backend powers',
  title: 'What plugin server code can do',
  summary:
    'Plugin server code receives a namespaced API for settings, storage, HTTP, RPC, realtime signals, services, schedules, CLI commands, agent configuration, tools, interactions, mentions, events, and host declarations. This inventory shows the capability and the host-owned boundary beside it, so “can add” never becomes “owns the provider, thread database, or composer.”',
  readingOrder: 16,
  readingMinutes: 4,
  headings: [
    { id: 'namespaced-backend', title: 'Server APIs stay namespaced' },
    { id: 'background-authority', title: 'Background work has a host lifecycle' },
    { id: 'agent-mediated-ui', title: 'Agent and UI requests stay host-mediated' },
  ],
  keywords: ['plugin API', 'settings', 'storage', 'RPC', 'realtime', 'agent tools'],
  searchTerms: ['plugin backend', 'server powers', 'plugin database', 'can plugins call models'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'plugins-model-and-lifecycle',
    'plugins-ui-surface-atlas',
    'foundations-rules-skills-tools',
  ],
})
