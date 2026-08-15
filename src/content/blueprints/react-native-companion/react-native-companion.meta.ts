import { definePageMeta } from '../../schema'

export default definePageMeta({
  id: 'blueprints-react-native-companion',
  route: '/blueprints/react-native-companion',
  section: 'blueprints',
  navTitle: 'React Native companion',
  title: 'React Native companion',
  summary: 'A Proposed native companion could start from BB’s named API, internal, WebSocket, Connect, machine, and change-subscription seams. The snapshot does not establish a mobile client, header-session contract, offline outbox, deep links, OS push relay, or React Native runtime suitability. This page turns each missing contract into a bounded decision instead of treating browser or desktop behavior as suitable for phones.',
  readingOrder: 27,
  readingMinutes: 4,
  headings: [
    { id: 'observed-current-seams', title: 'Observed current seams' },
    { id: 'explicit-gap', title: 'The explicit gap' },
    { id: 'proposed-smallest-path', title: 'Proposed smallest path' },
    { id: 'risks-unknowns-non-goals', title: 'Risks, Unknowns, and non-goals' },
  ],
  keywords: ['React Native', 'mobile', 'Connect', 'WebSocket', 'offline', 'push'],
  searchTerms: ['phone app', 'native client', 'mobile auth', 'deep link', 'APNs', 'FCM'],
  evidenceMix: ['observed', 'proposed', 'unknown'],
  relatedPageIds: ['operations-remote-access-machines', 'runtime-events-and-persistence', 'operations-self-hosting-security'],
})
