import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'interface-panels-files-environment',
  route: '/interface/panels-files-environment',
  section: 'interface',
  navTitle: 'Panels and environment',
  title: 'Panels, files, and environment',
  summary: 'The right side of a BB thread is a secondary work area for information, diffs, files, browser tabs, terminals, plugins, and new tabs. It changes from a wide resizable aside to a compact drawer. File and environment data are queried separately from thread history, so a thread can remain readable while a host, source, worktree, or file preview is unavailable.',
  readingOrder: 12,
  readingMinutes: 3,
  headings: [
    { id: 'one-thread-many-views', title: 'One thread, many secondary views' },
    { id: 'wide-aside-compact-drawer', title: 'Wide aside, compact drawer' },
    { id: 'history-and-availability', title: 'History can outlive the environment' },
  ],
  keywords: ['secondary panel', 'Info', 'Diff', 'file', 'browser', 'terminal', 'environment', 'worktree', 'branch'],
  searchTerms: ['right panel', 'open file', 'git diff', 'workspace unavailable', 'drawer', 'new tab'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'interface-timeline-and-follow-up',
    'interface-responsive-and-electron',
    'operations-remote-access-machines',
  ],
})
