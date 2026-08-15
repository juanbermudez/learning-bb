import { definePageMeta } from '../schema'

export default definePageMeta({
  id: 'runtime-runtime-boundaries',
  route: '/runtime/runtime-boundaries',
  section: 'runtime',
  navTitle: 'Runtime boundaries',
  title: 'Server, daemon, and provider',
  summary:
    'BB splits request authority from live execution. The server validates and builds a command, the host daemon owns the live runtime for an environment, and an AgentRuntime boundary exposes start, resume, run, and steer calls. A persisted provider id supports continuation, but the adapter loop, model calls, and checkpoint semantics are not established by the inspected source.',
  readingOrder: 6,
  readingMinutes: 3,
  headings: [
    { id: 'command-contract', title: 'The server builds the command' },
    { id: 'single-owner', title: 'The host daemon owns live execution' },
    { id: 'resume-gap', title: 'A provider id is a resume input, not provider internals' },
  ],
  keywords: ['server', 'host daemon', 'AgentRuntime', 'provider id', 'thread.start', 'turn.submit'],
  searchTerms: ['where work runs', 'server versus daemon', 'provider boundary', 'resume session', 'runtime owner'],
  evidenceMix: ['observed', 'inference', 'unknown'],
  relatedPageIds: ['runtime-send-queue-start', 'runtime-events-and-persistence', 'operations-remote-access-machines'],
})
