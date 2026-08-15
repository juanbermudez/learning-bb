import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'interface-shell-and-navigation',
  route: '/interface/shell-and-navigation',
  section: 'interface',
  navTitle: 'App shell',
  title: 'App shell and navigation',
  summary: 'Learn which BB layer owns the app shell, how the sidebar organizes threads, and why a focused pane is reflected in the route. The same mental model covers the home composer, ordinary threads, and plugin panels. It also explains why older tools links are aliases rather than a second navigation system, while keeping source-level behavior separate from rendered geometry.',
  readingOrder: 9,
  readingMinutes: 3,
  headings: [
    { id: 'who-owns-the-shell', title: 'Who owns the shell?' },
    { id: 'sidebar-switchboard', title: 'The sidebar is a work switchboard' },
    { id: 'focused-pane-and-aliases', title: 'The route follows the focused pane' },
  ],
  keywords: ['App', 'AppRoutes', 'AppLayout', 'sidebar', 'route', 'split pane', 'plugin panel'],
  searchTerms: ['navigation', 'shell', 'where is my thread', 'focused tab', 'old tools link'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'interface-start-a-thread',
    'interface-timeline-and-follow-up',
    'interface-responsive-and-electron',
  ],
})
