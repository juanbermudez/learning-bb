import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'plugins-ui-surface-atlas',
  route: '/plugins/ui-surface-atlas',
  section: 'plugins',
  navTitle: 'UI extension surface atlas',
  title: 'Where plugins appear in the BB interface',
  summary:
    'BB exposes stable slots for home, settings, navigation, panels, files, messages, composers, host-rendered interactions, and reusable host UI. Experimental slots can replace sharper pieces such as the thread list or new-thread composer, but each still has a host-owned limit. This atlas maps all stable and experimental surfaces to the visible BB anatomy and keeps the two contracts visibly separate.',
  readingOrder: 17,
  readingMinutes: 4,
  headings: [
    { id: 'stable-slots', title: 'Stable slots add bounded content' },
    { id: 'experimental-slots', title: 'Experimental slots expose sharper tradeoffs' },
    { id: 'host-anatomy', title: 'The host anatomy is the invariant' },
  ],
  keywords: ['plugin UI', 'slots', 'composer', 'thread list', 'navPanel', 'host chrome'],
  searchTerms: ['where plugins appear', 'plugin interface', 'replace sidebar', 'custom composer'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'interface-settings-and-extensions',
    'plugins-backend-powers',
    'plugins-compatibility-trust-fallbacks',
  ],
})
