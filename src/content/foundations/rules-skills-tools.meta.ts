import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'foundations-rules-skills-tools',
  route: '/foundations/rules-skills-tools',
  section: 'foundations',
  navTitle: 'Rules, skills, tools',
  title: 'Instructions, skills, tools, CLI, and SDK',
  summary:
    'This page separates instruction text, readable skill files, callable tools, plugin CLI commands, and administrative SDK access. They can meet at one provider turn, but they enter through different paths, have different owners, and carry different proof limits. The distinction gives a beginner a safe way to ask what the agent can read, call, run, or administer.',
  readingOrder: 19,
  readingMinutes: 4,
  headings: [
    { id: 'rules-text', title: 'Rules are instruction text' },
    { id: 'skills-files', title: 'Skills are readable resources' },
    { id: 'tools-cli-sdk', title: 'Tools, CLI, and SDK have different jobs' },
  ],
  keywords: [
    'AGENTS.md',
    'instructions',
    'skills',
    'tools',
    'plugin commands',
    'CLI',
    'SDK',
    'provider adapter',
  ],
  searchTerms: [
    'rules versus skills',
    'what can the agent call',
    'command line',
    'admin API',
    'tool access',
  ],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-agent-input', 'plugins-backend-powers', 'interface-settings-and-extensions'],
})
