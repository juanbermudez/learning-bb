import meta from './context-memory-goals.meta'
import sources from './context-memory-goals.sources.json'
import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
import {
  AtAGlance,
  DiagramCard,
  DocArticle,
  EvidenceCallout,
  Limits,
  PageSection,
  SourceDisclosure,
} from '../../components/content'

export { meta }

const sourceRecords = sources as unknown as readonly SourceRecord[]

const contextAndRecall = defineDiagramDefinition({
  id: 'context-memory-goals-map',
  title: 'Current context is not every durable record',
  caption: 'A turn receives selected inputs while history, memory, and goals retain separate records.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: [
    'turn-inputs',
    'agent-only-context',
    'prompt-history',
    'memory-records',
    'memory-catalog',
    'goal-record',
  ],
  code: `flowchart LR
  prompt["Visible prompt"] --> turn["Current turn"]
  hidden["Agent-only context"] --> turn
  instructions["Instructions and skills"] --> turn
  schemas["Tool schemas"] --> turn
  turn --> provider["Provider context"]
  history["Prompt history"] --> durable["Durable records"]
  memory["BB memory"] --> catalog["Bounded catalog"]
  catalog --> turn
  goal["Goal record"] --> timeline["Thread timeline"]`,
  textAlternative:
    'Observed: a visible prompt and agent-only context can be inputs to the current turn, alongside instructions, skills, and tool schemas. Those selected inputs reach provider context. Prompt history remains a durable record that can be read; the source does not say that every historical entry is injected into each turn. BB memory is also durable. Its bounded catalog can become instruction text, while full records require a separate search and get path. A goal record is projected into thread state. Inference: the arrows that reach the current turn are not the same as the records that can be retrieved later.',
})

const goalConfirmation = defineDiagramDefinition({
  id: 'goal-record-waiter-sequence',
  title: 'A waiter confirms a durable goal event',
  caption: 'The in-memory waiter is a bridge to event-backed state, not the state itself.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['goal-waiter', 'goal-clear-route', 'goal-events', 'goal-record', 'goal-shutdown'],
  code: `sequenceDiagram
  participant User
  participant Server
  participant Waiter
  participant Timeline
  User->>Server: Clear goal
  Server->>Waiter: Await clear event
  Waiter-->>Server: Event received
  Server->>Timeline: Verify durable state
  Timeline-->>Server: Durable record
  Server-->>User: Goal cleared`,
  textAlternative:
    'The user asks the server to clear a goal. The server starts the live operation and a runtime waiter waits for a provider goal-cleared event. When the event arrives, the server verifies the durable thread record and returns the updated state. The waiter is an in-memory coordination object: it answers when confirmation arrives, but it does not own the goal objective, status, budget, or source sequence. Those fields belong to the event-backed timeline record. Inference: after runtime shutdown, rebuilding from the durable record is the authority path; a process-local waiter cannot be the restart record.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed — current agent-only context is attached to a turn, not the whole historical record.',
          'Observed — BB memory stores durable records and exposes bounded catalog plus search/get.',
          'Observed — goals live in thread events; runtime waiters wait for durable confirmation.',
        ]}
      />

      <EvidenceCallout
        kind="observed"
        claim="A current turn can receive visible input and agent-only context, while prompt history, memory records, and goal records persist as separate stores."
        explanation="The word context is safest when it names the input being assembled for this turn. A durable record may be available for recall without being present in the provider’s current context window. This keeps the live prompt boundary visible even when the system offers convenient recall features or a user remembers the same topic from an earlier thread."
        sourceIds={['turn-inputs', 'agent-only-context', 'prompt-history', 'memory-records', 'goal-record']}
      />

      <DiagramCard definition={contextAndRecall} />

      <PageSection id="turn-context" title="Current context is what reaches this turn">
        <EvidenceCallout
          kind="observed"
          claim="Plugin mentions are resolved at send time and appended as agent-only context before the request is persisted and dispatched."
          explanation="Agent-only means the provider can receive the input without the text being ordinary visible user content. Queued messages use the same path, so a queue branch does not change the visibility distinction."
          sourceIds={['agent-only-context', 'queued-agent-only']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — the current context set should be read as separate groups: prompt, agent-only inputs, instructions and skills, and active tool schemas."
          explanation="Those groups have different assembly and ownership paths. Calling all of them memory hides the difference between text sent now and a resource that may be retrieved later."
          basedOn={['turn-inputs', 'agent-only-context', 'prompt-history']}
        />
      </PageSection>

      <PageSection id="durable-recall" title="History and memory are durable recall">
        <EvidenceCallout
          kind="observed"
          claim="Prompt history is bounded recall metadata scoped to a project or thread, and reading it does not inject every historical entry into the provider prompt."
          explanation="History is useful for finding prior prompts, but its storage and retrieval surface is distinct from the current prompt assembly."
          sourceIds={['prompt-history']}
        />
        <EvidenceCallout
          kind="observed"
          claim="BB memory stores full records in SQLite and injects only a bounded catalog of summaries for progressive disclosure."
          explanation="The catalog directs the agent to `bb memory search` and `bb memory get` when more detail is needed. Full records, versions, timestamps, and history remain durable data rather than an automatic transcript prefix."
          sourceIds={['memory-records', 'memory-catalog']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — durable recall becomes current context only through an explicit catalog or retrieval path."
          explanation="A stored prompt or memory record can outlive the turn that created it, but storage alone does not place the full record into a later provider context window."
          basedOn={['prompt-history', 'memory-records', 'memory-catalog']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown — provider-native memory is not a proven synonym for BB memory, and the inspected source does not establish merging or deduplication."
          explanation="The bundled memory skill recommends disabling provider-native memory, while app settings default native memory features on for the inspected providers. That contradiction is evidence of two coexisting controls, not proof of one shared store."
          sourceIds={['memory-skill-recommendation', 'native-memory-defaults', 'native-memory-config']}
        />
      </PageSection>

      <DiagramCard definition={goalConfirmation} />

      <PageSection id="goals-and-waiters" title="Goals are records, not waiters">
        <EvidenceCallout
          kind="observed"
          claim="A goal is a thread timeline record with an objective, status, budget, usage, source sequence, and update time."
          explanation="Goal events are scoped as thread metadata. They belong to durable thread state, not to the text of one turn."
          sourceIds={['goal-record', 'goal-events']}
        />
        <EvidenceCallout
          kind="observed"
          claim="RuntimeThreadGoalState tracks provider goal-clear events so the clear route can wait and verify durable state."
          explanation="A waiter is coordination: it holds a pending promise or listener until the expected event arrives. The route’s verification step is what checks the durable result."
          sourceIds={['goal-waiter', 'goal-clear-route']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — an event-backed goal can outlive a runtime waiter."
          explanation="The waiter helps a live request finish, while the goal record carries the state that later timeline reads and restart reconciliation can use."
          basedOn={['goal-record', 'goal-waiter', 'goal-clear-route']}
        />
      </PageSection>

      <PageSection id="restart-boundary" title="Restart rebuilds live state">
        <EvidenceCallout
          kind="observed"
          claim="Runtime shutdown clears in-memory goal maps, while the goal event and record remain the durable authority."
          explanation="The same lifetime split applies to other recall systems: memory records and prompt history persist, while the exact in-memory assembly for a live process is rebuilt at a later runtime boundary."
          sourceIds={['goal-shutdown', 'memory-records', 'prompt-history']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown — the inspected source does not prove that a restarted provider receives a byte-for-byte copy of its former hidden context."
          explanation="It proves durable records and the inputs used to rebuild a session, not identical provider-native caches or identical hidden prompt bytes after every restart."
          sourceIds={['goal-shutdown', 'memory-records', 'prompt-history']}
        />
      </PageSection>

      <Limits>
        <li><strong>Inference.</strong> Durable recall is not current context: a record needs an explicit retrieval or catalog path before it can influence a later turn. Sources: prompt-history, memory-catalog.</li>
        <li><strong>Inference.</strong> A runtime waiter confirms an event; it does not replace the event-backed goal record. Sources: goal-waiter, goal-record.</li>
        <li><strong>Unknown.</strong> Provider-native memory remains a separate, provider-owned feature whose cross-system meaning is not established. Sources: memory-skill-recommendation, native-memory-defaults.</li>
      </Limits>

      <SourceDisclosure sources={sourceRecords} />
    </DocArticle>
  )
}
