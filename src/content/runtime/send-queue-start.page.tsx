import { defineDiagramDefinition, type SourceRecord } from '../../content/schema'
import meta from './send-queue-start.meta'
import sourcesData from './send-queue-start.sources.json'
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

const sendPathDiagram = defineDiagramDefinition({
  id: 'send-path',
  title: 'Intent crosses the server boundary',
  caption: 'The app shows intent locally; the server chooses a queue or a host command.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['ui-submit', 'queue-route', 'request-event', 'live-command'],
  code: `graph LR
  App[PromptInput] --> Server[Send route]
  Server --> Request[Durable request]
  Server --> Queue[Queued message]
  Server --> Daemon[Host command]
  Daemon --> Events[Provider events]`,
  textAlternative:
    'Read left to right. The app submits structured PromptInput to the server send route and may first show a local optimistic row. The server then takes one of two observed branches: an active thread can receive a saved queued message, or an accepted request can become a durable client/turn/requested event and a host command. The host daemon later sends provider events back through the event path. The connection between the visible app action and the full return loop is an Inference assembled from these boundaries; the diagram does not claim that the browser calls a provider directly.',
})

const commandChoiceDiagram = defineDiagramDefinition({
  id: 'start-submit-choice',
  title: 'A provider id changes the command',
  caption: 'A normal start-mode send starts only when no persisted provider session id is available.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['start-vs-submit', 'target-resolution', 'history-replacement'],
  code: `graph TD
  Accepted[Accepted request] --> Active{Active turn?}
  Active -->|yes| Queued[Queued message]
  Active -->|no| ProviderId{Provider id?}
  ProviderId -->|no| Start[thread.start]
  ProviderId -->|yes| Submit[turn.submit]
  Accepted --> Steer[Steer target]`,
  textAlternative:
    'Start with the accepted request. If the thread is active, the queue branch can stop before a provider command. If it is ready, the server reads the latest persisted provider session id. No id leads to thread.start; an id leads to turn.submit for the existing session. A follow-up may instead use a steer or auto target, subject to the current thread state. The history-replacement path deliberately starts or forks a fresh session. These branches correct the idea that the first visible message alone determines the command.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The composer sends structured input, then the server decides what is durable.',
          'An optimistic row is a preview, not proof of provider output.',
          'A queue branch can save work without running a provider command yet.',
        ]}
      />

      <p>
        Pressing Send does not jump from a browser button to a model. The app
        snapshots the draft, chooses a follow-up mode, and updates its local cache.
        The server then either records a queued message or accepts a request for
        host execution. That separation explains why the screen can change before
        durable events return.
      </p>

      <DiagramCard definition={sendPathDiagram} />

      <PageSection id="request" title="The request starts in the composer">
        <p>
          <strong>Observed.</strong> The embedded chat composer refuses empty or
          already-submitting input, snapshots the structured draft, and clears the
          draft optimistically. The normal mutation uses
          <code>mode: "queue-if-active"</code>; a display state that requires a
          dedicated queued-message mutation takes that path instead.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The app creates an optimistic user or queued row before the server result is known."
          explanation="The optimistic row omits input marked agent-only, so the visible preview is not the complete agent input."
          sourceIds={['ui-submit', 'optimistic-row']}
        />
        <p>
          This row is useful feedback, but it has a different lifetime from a
          stored event. A failed mutation restores the draft and can roll back the
          preview. A successful preview still does not mean that a provider has
          started or returned output.
        </p>
      </PageSection>

      <PageSection id="queue" title="An active turn can queue the message">
        <p>
          <strong>Observed.</strong> The server send route reads the thread state.
          When an active thread receives <code>queue-if-active</code>, the route
          writes a queued message and returns success without running a provider
          command. The same guard covers non-start work while a standalone manual
          compaction request is active.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="A successful Send response can mean “saved for later,” not “the provider is running.”"
          explanation="This follows from the local optimistic row and the server’s queue branch; the response alone does not identify the later execution time."
          basedOn={['optimistic-row', 'queue-route']}
        />
        <EvidenceCallout
          kind="inference"
          claim="The queue is a deliberate branch in the control path."
          explanation="User intent can be durable before the active turn finishes, while the UI keeps the queued row visible as work waiting for the next eligible handoff."
          basedOn={['queue-route', 'request-event']}
        />
      </PageSection>

      <PageSection id="command-choice" title="Start, submit, and steer are different choices">
        <p>
          <strong>Observed.</strong> The server resolves the request target before
          dispatch. A normal start-mode send checks the latest stored provider
          thread id: no id produces <code>thread.start</code>, while an existing id
          produces <code>turn.submit</code>. A missing id on a submit path is an
          explicit conflict, not an implicit new session.
        </p>
        <DiagramCard definition={commandChoiceDiagram} />
        <EvidenceCallout
          kind="inference"
          claim="“The first message always starts” is too strong."
          explanation="A persisted provider id can make a new-turn request use turn.submit; history replacement is the explicit start-or-fork exception."
          basedOn={['start-vs-submit', 'history-replacement']}
        />
        <p>
          <code>steer</code> and <code>auto</code> describe follow-up targets, not a
          promise about provider internals. The follow-up decision also considers
          active work, reconnecting or starting states, pending interactions, and
          execution options that are still loading. A stale steer target may fall
          back to a new run at the host boundary.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Follow-up submission mode is chosen from the current thread state."
          explanation="Queueing, stopping, interaction, and loading states change whether the composer can send, queue, or wait."
          sourceIds={['target-resolution']}
        />
      </PageSection>

      <PageSection id="durable-handoff" title="The server records intent before provider output">
        <p>
          <strong>Observed.</strong> Once validation and target resolution pass,
          the server appends a <code>client/turn/requested</code> event with the
          input, execution choices, initiator, sender and target details, and a
          request id. It also records prompt history. The event is durable send
          intent; it is not a provider response.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The host command is prepared after the accepted request is appended."
          explanation="The server notifies its hub and starts the live host command for the selected start or submit payload."
          sourceIds={['request-event', 'live-command']}
        />
        <p>
          This is the handoff to the next page. The server owns acceptance and
          durable request state. The host daemon owns the live runtime boundary;
          its provider events return through a separate persistence path. Keeping
          those clocks separate prevents a local row, a request event, and provider
          output from being treated as the same object.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="Submission, server persistence, and live host activity are separate checkpoints."
          explanation="Track the composer decision, the server’s accepted or queued state, and later host activity. The first checkpoint explains what the user attempted; the second explains what the server accepted; the third is evidence that the host returned runtime activity. A screen at the first checkpoint can still be corrected by the next server response. A screen at the second can still wait for, or lose, later provider output. This vocabulary keeps optimistic, durable, and runtime states legible without claiming a provider schedule."
          basedOn={['ui-submit', 'request-event', 'live-command']}
        />
      </PageSection>

      <Limits>
        <li>The source does not prove when a queued message will later run.</li>
        <li>An optimistic row does not prove a provider command or provider output.</li>
        <li>The inspected boundary does not expose the provider adapter’s internal loop.</li>
      </Limits>
      <SourceDisclosure sources={sources} />
    </DocArticle>
  )
}
