import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'interface-responsive-and-electron',
  route: '/interface/responsive-and-electron',
  section: 'interface',
  navTitle: 'Responsive and Electron',
  title: 'Responsive, browser, and Electron',
  summary: 'BB has separate responsive states for host navigation, secondary panels, and plugin interiors. Compact web layouts use drawers and can fall back from split panes; they do not become a native mobile app. Electron adds a native in-panel browser through a preload and WebContentsView boundary, while ordinary web mode exposes an unavailable state for that capability.',
  readingOrder: 14,
  readingMinutes: 3,
  headings: [
    { id: 'host-drawer-and-plugin-drawer', title: 'Host drawers and plugin drawers are different' },
    { id: 'split-panes-have-fallback', title: 'Split panes have a compact fallback' },
    { id: 'browser-capabilities-by-host', title: 'Browser capability depends on the host' },
  ],
  keywords: ['responsive', 'compact viewport', 'drawer', 'split pane', 'browser', 'Electron', 'WebContentsView'],
  searchTerms: ['mobile web', 'native app', 'desktop browser', 'browser unavailable', 'responsive breakpoint', 'compact panel'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'interface-panels-files-environment',
    'interface-shell-and-navigation',
    'operations-remote-access-machines',
  ],
})
