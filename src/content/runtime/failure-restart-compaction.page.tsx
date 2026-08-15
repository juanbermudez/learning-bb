import { defineDiagramDefinition, type SourceRecord } from '../../content/schema'
import meta from './failure-restart-compaction.meta'
import sourcesData from './failure-restart-compaction.sources.json'
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

const sources = sourcesData as readonly SourceRecord[]

const restartDiagram = defineDiagramDefinition({
  id: 'restart-lifetimes',
  title: 'Restart separates durable and live state',
  caption: 'A reconnect can preserve a live process; a daemon crash loses pending in-memory sink items.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['session-open', 'same-instance-reconnect', 'durable-state', 'runtime-state', 'sink-loss', 'reconciliation'],
  code: `graph LR
  Rows[Server event rows] --> Rebuild[Rebuild session]
  Files[Thread storage] --> Rebuild
  Reconnect[Same-instance reconnect] --> Rebuild
  Runtime[Runtime entry] --> Restart[Process restart]
  Queue[Memory-only sink] --> Restart
  Rebuild --> Resume[Provider id resume]`,
  textAlternative:
    'Read the durable side first. Server event rows and thread-storage files remain inputs for rebuilding a session. A same-instance reconnect can preserve resident runtime work while the daemon reopens its session. On the shorter-lived side, the RuntimeEntry and provider process are in memory, and the pending event-sink queue is also in memory. A process restart therefore enters reconciliation rather than proving that every active turn resumes. The stored provider id can be one resume input when a valid runtime context is rebuilt. The crossed lifetime distinction is the important result: reconnect is not the same event as daemon crash.',
})

const compactionDiagram = defineDiagramDefinition({
  id: 'compaction-kinds',
  title: 'Two meanings of compaction',
  caption: 'Manual provider work emits provider events; read-side summary compaction only reduces a display projection.',
  evidenceMix: ['observed', 'inference', 'unknown'],
  sourceIds: ['manual-compact', 'compaction-events', 'read-side-compaction', 'timeline-budget', 'provider-compaction-gap'],
  code: `graph LR
  Request[Manual /compact] --> Provider[Provider work ?]
  Provider --> Event[Compaction event]
  Rows[Event rows] --> Summary[Read-side summary]
  Summary --> Display[Display window]
  Usage[Context usage] --> Display`,
  textAlternative:
    'Read the two lanes separately. Manual /compact is a server command that asks for provider-side work when the thread is writable and idle or errored. Completion is represented by provider compaction or context-cleared events. The provider work node has a question mark because the summarization algorithm and replacement semantics are outside scope. In the second lane, stored event rows pass through read-side summary compaction and a bounded display window. Provider context usage is separate metadata. The second lane protects server reads and UI rendering; it does not ask a provider to compact its conversation.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Same-instance reconnect and a new daemon instance have different effects.',
          'Durable rows can outlive a runtime process and pending memory-only sink items.',
          'Provider compaction and display-summary windowing are separate operations.',
        ]}
      />

      <p>
        “Restart” is not one state transition. A socket can reconnect to the same
        daemon instance, a new daemon can report a different active-thread set, or a
        provider process can exit while its thread still has durable history. The
        recovery result depends on which boundary failed and which durable inputs are
        available afterward.
      </p>

      <DiagramCard definition={restartDiagram} />

      <PageSection id="reconnect" title="Reconnect and restart take different paths">
        <p>
          <strong>Observed.</strong> The daemon opens a session with its host,
          instance, data directory, protocol version, active thread ids, and loaded
          environments. A same-instance reconnect closes the superseded socket
          without interrupting active provider work. A different daemon instance
          causes the server to interrupt active threads with
          <code>host-daemon-restarted</code> and settle dangling work.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="A disconnected socket gets a grace window before active-turn interruption."
          explanation="That window lets a same-process reconnect drain its live event window; it does not make a new daemon equivalent to the old process."
          sourceIds={['session-open', 'same-instance-reconnect', 'disconnect-grace']}
        />
        <p>
          On session open, reconciliation compares persisted thread state with the
          daemon’s reported active list. It can re-dispatch pending stops, finalize
          missing stops, revive an error thread reported active, or interrupt a
          persisted active thread that is missing from the report.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Restart reconciliation is an explicit comparison, not a blanket claim that every turn resumes."
          explanation="The server applies different outcomes to reported, missing, starting, idle, and interrupted threads."
          sourceIds={['reconciliation']}
        />
      </PageSection>

      <PageSection id="survival" title="Durable records outlive live process state">
        <p>
          <strong>Observed.</strong> Server event rows, request metadata, prompt
          history, and thread-storage files are distinct from the daemon’s live
          <code>RuntimeEntry</code>, provider process, runtime maps, and goal waiter.
          Shutdown closes runtime entries and provider processes without destroying
          the workspace. A same-process socket reconnect can flush recoverable event
          messages; a daemon crash drops pending event-sink items.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="Restart can preserve the record of a request while losing a gap in provider output."
          explanation="The request and earlier event rows are server-owned, but not-yet-posted sink items are process memory."
          basedOn={['durable-state', 'runtime-state', 'sink-loss']}
        />
        <p>
          The latest stored provider id and thread-storage path may provide inputs
          for a later resume. That is weaker than “restart resumes everything.” A
          new runtime must reconstruct current instructions, skills, tools, options,
          and ownership; the provider may have its own recovery rules.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The source does not prove byte-for-byte recovery of a previous hidden provider prompt."
          explanation="It proves durable records and reassembly inputs, not identical provider behavior after every restart."
          sourceIds={['resume-limit']}
        />
      </PageSection>

      <PageSection id="provider-exit" title="A provider exit becomes a failure event">
        <p>
          <strong>Observed.</strong> When a provider process exits during an active
          turn, the runtime manager synthesizes a failed completion and a system
          error for the thread with a provider id. The event callback forwards those
          events to the server, which applies <code>run.failed</code> and interrupts
          pending interactions.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Provider-process exit is represented in the server event path rather than silently disappearing."
          explanation="The failure event can update durable status and pending interaction state even though provider output may be incomplete."
          sourceIds={['provider-exit', 'failure-effects']}
        />
        <p>
          This produces a useful boundary for readers: a failed status is evidence
          of the host’s failure handling, not evidence about the provider’s internal
          checkpoint or partial output. Whether a later resume succeeds depends on a
          valid provider id, runtime context, and provider-specific behavior.
        </p>
      </PageSection>

      <PageSection id="compaction" title="Provider compaction is not timeline windowing">
        <p>
          <strong>Observed.</strong> Manual provider compaction is a writable server
          route. It requires provider support and a thread that is idle or errored,
          then sends a standalone built-in compact request. Completion is represented
          by <code>thread/compacted</code> and/or
          <code>thread/context/cleared</code> events carrying provider identity.
        </p>
        <DiagramCard definition={compactionDiagram} />
        <EvidenceCallout
          kind="observed"
          claim="The timeline builder’s summary compaction is a read-side event reduction, not a provider command."
          explanation="It operates while building a bounded display/read model and does not itself change provider context."
          sourceIds={['manual-compact', 'compaction-events', 'read-side-compaction']}
        />
        <p>
          The server also applies event and byte budgets to timeline reads. Provider
          context usage is a separate event with used tokens, model context window,
          and estimated or unknown state. A 1,500-event display window is therefore
          not a 1,500-token provider prompt, and pagination is not provider
          compaction.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="“Context,” “timeline window,” and “compaction” must remain three labels."
          explanation="They describe provider usage, server read bounds, and provider-side conversation work respectively."
          basedOn={['timeline-budget', 'context-usage', 'read-side-compaction']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="The provider’s summarization algorithm, replacement semantics, and event-emission combination are Unknown."
          explanation="The source establishes the command and event boundary, not the provider’s internal compaction behavior."
          sourceIds={['provider-compaction-gap']}
        />
      </PageSection>

      <Limits>
        <li>Pending memory-only sink items do not survive a daemon crash, even when earlier rows survive.</li>
        <li>A provider id and storage path are resume inputs, not a guarantee of successful or identical recovery.</li>
        <li>Read-side summary compaction and timeline windows do not prove that the provider compacted its conversation.</li>
      </Limits>
      <SourceDisclosure sources={sources} />
    </DocArticle>
  )
}
