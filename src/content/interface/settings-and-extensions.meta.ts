import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'interface-settings-and-extensions',
  route: '/interface/settings-and-extensions',
  section: 'interface',
  navTitle: 'Settings and Extensions',
  title: 'Settings and Extensions',
  summary: 'Settings configures the host; Extensions is where skills and plugins are browsed, installed, and managed. Both surfaces are conditional: daemon state, provider availability, feature flags, plugin configuration, and enabled bundles change what appears. A plugin panel can own its body while BB keeps the route, title bar, navigation, and failure boundary.',
  readingOrder: 13,
  readingMinutes: 3,
  headings: [
    { id: 'settings-is-conditional', title: 'Settings is conditional host configuration' },
    { id: 'extensions-owns-addons', title: 'Extensions organizes add-on capabilities' },
    { id: 'host-and-plugin-boundary', title: 'The host and plugin share a boundary' },
  ],
  keywords: ['Settings', 'Extensions', 'Skills', 'Plugins', 'Automations', 'plugin panel', 'settings section'],
  searchTerms: ['configure BB', 'install plugin', 'manage skills', 'Tasks', 'Docs', 'extension unavailable'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: [
    'interface-shell-and-navigation',
    'interface-panels-files-environment',
    'plugins-ui-surface-atlas',
  ],
})
