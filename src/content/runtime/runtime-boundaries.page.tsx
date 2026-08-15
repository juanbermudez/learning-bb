import { defineDiagramDefinition, type SourceRecord } from '../../content/schema'
import meta from './runtime-boundaries.meta'
import sourcesData from './runtime-boundaries.sources.json'
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

const runtimeBoundaryDiagram = defineDiagramDefinition({
  id: 'runtime-boundaries',
  title: 'Three owners meet at a command',
  caption: 'The server owns acceptance, the daemon owns the live runtime, and provider internals remain an explicit gap.',
  evidenceMix: ['observed', 'inference', 'unknown'],
  sourceIds: ['server-start-command', 'daemon-dispatch', 'runtime-entry', 'provider-gap'],
  code: `graph LR
  Server[Server] --> Command[Runtime command]
  Command --> Daemon[Host daemon]
  Daemon --> Owner[Runtime owner]
  Owner --> Provider[Provider adapter ?]
  Server --> Rows[Event rows]`,
  textAlternative:
    'Read from left to right. The server constructs a named runtime command and also owns the event-row side of the system. The command crosses to the host daemon, which retains the environment and calls a runtime owner. The RuntimeEntry is the observed host-side ownership record. The final Provider adapter node carries a question mark because the inspected source stops at AgentRuntime calls; it does not establish the adapter loop, model API calls, checkpoint format, or provider-native resume behavior. The diagram shows ownership boundaries, not a claim about internal process topology.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The server accepts requests and builds runtime command payloads.',
          'The host daemon owns one live runtime for a thread and environment.',
          'Provider adapter internals remain Unknown beyond the AgentRuntime calls.',
        ]}
      />

      <p>
        The word “runtime” hides several owners. The server decides whether a
        request is valid and what command should be sent. The host daemon keeps the
        environment and live runtime relationship. The provider boundary is reached
        through an AgentRuntime interface, but the inspected source does not show
        what happens inside that interface.
      </p>

      <DiagramCard definition={runtimeBoundaryDiagram} />

      <PageSection id="command-contract" title="The server builds the command">
        <p>
          <strong>Observed.</strong> A <code>thread.start</code> command carries
          workspace context, project and provider ids, request input, execution
          options, assembled instructions, dynamic tools, injected skill sources,
          instruction mode, and the thread-storage path. A
          <code>turn.submit</code> payload carries the existing runtime context plus
          the persisted provider thread id and target mode.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="A missing provider id on the submit path is an explicit server conflict."
          explanation="The server does not silently turn a submit request into a new provider session at this boundary."
          sourceIds={['server-start-command', 'server-submit-command', 'missing-provider-id']}
        />
        <p>
          This makes the server the request and command authority. It can assemble
          the data needed by a host, but the command shape is not the same as a
          provider transcript. The server’s provider id is a continuation key used
          across the boundary, not a description of the provider’s storage model.
        </p>
      </PageSection>

      <PageSection id="single-owner" title="The host daemon owns live execution">
        <p>
          <strong>Observed.</strong> The command dispatcher routes
          <code>thread.start</code> to start handling and <code>turn.submit</code>
          to runtime assurance plus submission. Starting a thread resolves the
          workspace, stages command input, and calls
          <code>entry.runtime.startThread</code>. A submit can resume a missing
          runtime before calling <code>runTurn</code>; a steer calls
          <code>steerTurn</code> and can fall back when its target is stale.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="RuntimeEntry records the live AgentRuntime together with its environment, workspace, storage path, and related runtime state."
          explanation="The runtime manager releases an old same-thread owner before resuming in another environment, preventing two live owners for the same provider session."
          sourceIds={['daemon-dispatch', 'daemon-start-resume', 'runtime-entry', 'owner-release']}
        />
        <p>
          The practical boundary is therefore the host daemon, not the browser. A
          browser control can request work, and a server can prepare a command, but
          the daemon is the component that holds the live runtime handle and sends
          the call into it. This is also why environment changes matter to runtime
          ownership even when thread history remains on the server.
        </p>
      </PageSection>

      <PageSection id="resume-gap" title="A provider id is a resume input, not provider internals">
        <p>
          <strong>Observed.</strong> When the daemon lacks a live runtime, it can
          require the command’s persisted provider id and call
          <code>resumeThread</code> with that id, instructions, dynamic tools,
          disallowed tools, and instruction mode. The live entry then receives a
          run or steer request.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="Continuation depends on both durable identity and live host ownership."
          explanation="The server supplies the latest provider id, while the daemon must have or rebuild a valid RuntimeEntry and context before resuming."
          basedOn={['missing-provider-id', 'daemon-start-resume', 'owner-release']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="The provider adapter loop, model API calls, checkpoint format, token accounting, and provider-native resume semantics are Unknown here."
          explanation="The scoped evidence stops at AgentRuntime.startThread, resumeThread, runTurn, and steerTurn calls."
          sourceIds={['provider-gap']}
        />
        <p>
          Keep that gap visible. Naming a provider adapter does not prove how it
          stores context, when it calls a model, or what it can recover after a
          process exit. Those questions belong to provider-specific evidence, not to
          this server-daemon boundary page.
        </p>
      </PageSection>

      <Limits>
        <li>The command contract does not expose provider implementation details.</li>
        <li>A stored provider id does not prove that every provider can resume identically.</li>
        <li>Live ownership is source-proven; authenticated machine or deployment behavior is outside this page.</li>
      </Limits>
      <SourceDisclosure sources={sources} />
    </DocArticle>
  )
}
