import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'operations-remote-access-machines',
  route: '/operations/remote-access-machines',
  section: 'operations',
  navTitle: 'Remote access and machines',
  title: 'How remote access and machines cross boundaries',
  summary:
    'Remote access in BB is a set of distinct paths, not one switch. The browser controls, the server owns policy and state, and a host daemon runs work. Connect adds account and machine gates around local listeners, while explicit port shares expose only registered ports. This page separates owner sessions, machine credentials, and daemon host keys.',
  readingOrder: 22,
  readingMinutes: 4,
  headings: [
    { id: 'where-work-runs', title: 'Where work runs' },
    { id: 'which-gate-crosses', title: 'Which gate each credential crosses' },
    { id: 'what-connect-carries', title: 'What Connect carries' },
    { id: 'how-machines-enroll', title: 'How machines enroll and leave' },
  ],
  keywords: ['remote access', 'Connect', 'machine', 'host daemon', 'port share'],
  searchTerms: ['remote browser', 'execution host', 'enroll computer', 'remote server'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-runtime-boundaries', 'operations-self-hosting-security'],
})
