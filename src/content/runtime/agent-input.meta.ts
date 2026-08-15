import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'runtime-agent-input',
  route: '/runtime/agent-input',
  section: 'runtime',
  navTitle: 'Agent input',
  title: 'What the agent receives',
  summary:
    'The visible prompt is only one part of a runtime command. BB keeps user text, agent-only context, attachments, instructions, skills, callable tools, and execution options distinct. The server resolves and validates these inputs before dispatch, then sends a bounded assembly to the host. A provider may interpret the assembly differently; that adapter boundary remains outside this source scope.',
  readingOrder: 5,
  readingMinutes: 4,
  headings: [
    { id: 'visible-input', title: 'The prompt is structured input' },
    { id: 'validation-staging', title: 'Context is resolved and files are staged' },
    { id: 'instruction-order', title: 'Instructions have a defined order' },
    { id: 'skills-tools-options', title: 'Skills, tools, and options stay distinct' },
  ],
  keywords: ['PromptInput', 'agent-only', 'attachments', 'mentions', 'instructions', 'skills', 'dynamic tools'],
  searchTerms: ['hidden context', 'what agent sees', 'AGENTS.md', 'skill file', 'plugin mention', 'prompt assembly'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-send-queue-start', 'foundations-rules-skills-tools', 'foundations-context-memory-goals'],
})
