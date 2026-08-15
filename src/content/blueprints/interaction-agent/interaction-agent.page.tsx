import { Link } from 'react-router-dom'
import {
  AtAGlance,
  DataTable,
  DiagramCard,
  DocArticle,
  EvidenceBadge,
  EvidenceCallout,
  Limits,
  PageSection,
  SourceDisclosure,
} from '../../../components/content'
import { defineDiagramDefinition, type SourceRecord } from '../../schema'
import meta from './interaction-agent.meta'
import sources from './interaction-agent.sources.json'

export { meta }

const pageSources = sources as unknown as readonly SourceRecord[]

const interactionDiagram = defineDiagramDefinition({
  id: 'interaction-agent-seams-and-proposals',
  title: 'Observed thread seams, Proposed interaction surface',
  caption: 'The solid path is an existing hidden-fork and queue precedent; dashed paths are future interaction contracts.',
  evidenceMix: ['observed', 'proposed', 'unknown'],
  sourceIds: ['side-chat-fork', 'queued-messages', 'plugin-context', 'freshness-audit'],
  code: `flowchart LR
classDef observed fill:var(--surface),stroke:var(--line-strong),stroke-width:1.5px
classDef proposed fill:var(--surface-subtle),stroke:var(--evidence-proposed),stroke-width:1.5px,stroke-dasharray:9 6
classDef unknown fill:var(--surface-subtle),stroke:var(--evidence-unknown),stroke-width:1.5px,stroke-dasharray:2 5
main["Observed: Main thread"] --> fork["Observed: Hidden fork"]
fork --> queue["Observed: Queued message"]
queue --> main
dock["Proposed: Voice dock"] -.-> bus["Proposed: Context bus"]
bus -.-> agent["Proposed: Interaction thread"]
voice["Proposed: Streaming voice"] -.-> dock
choice["Unknown: TTS choice"] -.-> voice
class main,fork,queue observed
class dock,bus,agent,voice proposed
class choice unknown`,
  textAlternative: 'Read left to right. An existing main thread can create a hidden side-chat fork, and a queued message can return work to the main-thread surface; those three nodes and solid arrows are Observed. The future interaction surface is separate: a Proposed voice dock would send a route and selection snapshot through a Proposed context bus to a dedicated interaction thread. A Proposed streaming voice path would connect to the dock. The TTS choice is Unknown, so it is shown with a dotted edge and a question label. The diagram does not show a persistent global assistant as a delivered feature. It shows a small reuse path and the contracts that still need product, SDK, and runtime decisions.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed: hidden side-chat forks and queued messages already provide a narrow plugin path.',
          'Proposed: a persistent dock, context bus, dedicated interaction thread, and streaming voice.',
          'Unknown: TTS choice, global push-to-talk, and cross-thread event subscription need decisions.',
        ]}
      />

      <EvidenceCallout
        kind="proposed"
        claim="Proposal only: describe the smallest Interaction Agent path without presenting an assistant as delivered behavior."
        explanation="The path starts with a first-party plugin and generic host seams. It does not make the dock, voice stream, or global shortcut an existing BB surface."
        sourceIds={['freshness-audit', 'interaction-guide']}
      />

      <PageSection id="observed-current-seams" title="Observed current seams">
        <p>
          <strong>User outcome.</strong> A reader should be able to see what a future
          interaction agent may reuse, and where a new contract would begin. BB’s
          shipped side-chat precedent is useful, but it is not a central assistant:
          the plugin creates a hidden fork for a source panel and reuses that source
          workspace.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The side-chat plugin creates hidden, attributed forks, while lifecycle events let a plugin observe thread state."
          explanation="That gives a future plugin a thread-shaped session and a way to report idle or failed outcomes without inventing a second runtime."
          sourceIds={['side-chat-fork', 'thread-lifecycle']}
        />
        <p>
          Thread APIs already cover sending, stopping, and queueing work. The queue
          behavior is conditional: an idle thread with an existing provider thread
          may auto-dispatch, while explicit send is a separate path. This is a
          useful handoff seam, not proof of cross-thread dispatch policy.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The app foundation includes a personal project and a narrow plugin context of projectId and threadId."
          explanation="The foundation removes one stale premise from the guide, but it does not establish a dedicated interaction thread or a rich selection bus."
          sourceIds={['personal-project', 'plugin-context']}
        />
        <nav aria-label="Current page backlinks">
          <p><strong>Current-page backlinks.</strong> Read the present seams in context:</p>
          <ul>
            <li><Link to="/runtime/runtime-boundaries">Server, daemon, and provider</Link></li>
            <li><Link to="/runtime/send-queue-start">What happens when you press Send</Link></li>
            <li><Link to="/plugins/model-and-lifecycle">Plugin mental model and lifecycle</Link></li>
          </ul>
        </nav>
      </PageSection>

      <PageSection id="explicit-gap" title="The explicit gap">
        <p>
          The missing feature is not “a plugin can start a thread.” The gap is an
          always-available surface that can capture context at utterance time,
          dispatch to one durable interaction thread, and return an auditable result
          without hiding the active user thread. The existing realtime publication
          path is ephemeral and broadcast-oriented, so it cannot by itself provide a
          durable context stream or per-channel subscription.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The inspected seams do not establish which user selections a future context bus may publish or how a plugin backend follows other threads."
          explanation="The public contract exposes interactions and batch voice routes, but streaming STT, TTS, global push-to-talk, and a dedicated event subscription remain unanswered."
          sourceIds={['plugin-context', 'voice-routes', 'freshness-audit']}
        />
        <p>
          Keep batch transcription as the smallest voice step: record, upload, and
          turn the result into text. Treat streaming input and spoken output as later
          choices. A protocol change is only relevant if an implementation changes a
          server-to-daemon payload; this page does not authorize a version bump.
        </p>
      </PageSection>

      <PageSection id="proposed-smallest-path" title="Proposed smallest path">
        <DiagramCard definition={interactionDiagram} />
        <p>
          <strong>Proposed.</strong> Add one exclusive dock slot and a generic context
          bus to the app shell. Let a first-party plugin own a hidden, long-lived
          interaction thread, configure its tools at session construction, and use
          existing send, queue, stop, and pane-control seams. Start voice with the
          observed batch transcription flow. Add streaming voice, TTS, global
          push-to-talk, and cross-thread subscriptions only after their contracts are
          separately specified.
        </p>
        <p>
          <strong>Legend.</strong> <EvidenceBadge label="Observed" /> uses a solid
          1.5px stroke; <EvidenceBadge label="Proposed" /> uses a dashed `9 6`
          stroke; <EvidenceBadge label="Unknown" /> uses a dotted `2 5` stroke.
          The words and patterns remain visible in both themes, so color is not the
          only status signal.
        </p>
        <DataTable
          caption="Ownership boundaries for the smallest proposed path"
          headers={['Area', 'Observed seam to reuse', 'Proposed owner', 'Missing contract']}
          rows={[
            ['App shell', 'Plugin slots and composer machinery', 'Core + plugin SDK', 'Exclusive dock slot'],
            ['Interaction session', 'Hidden fork and lifecycle events', 'First-party plugin', 'Long-lived-thread policy'],
            ['Context', 'projectId and threadId', 'Core context bus', 'Selection schema and privacy'],
            ['Voice', 'Batch transcription route', 'Server + app plugin', 'Streaming/TTS transport'],
            ['Desktop input', 'In-app shortcuts and mic permission home', 'Desktop shell', 'Global push-to-talk'],
          ]}
        />
      </PageSection>

      <PageSection id="risks-unknowns-non-goals" title="Risks, Unknowns, and non-goals">
        <p>
          <strong>Risks.</strong> A persistent dock could compete with the route
          composer, leak selected document or task data across scopes, or imply that
          plugin realtime is durable. A hidden thread can also become a second source
          of truth if its result and the user’s active thread are not linked by an
          explicit event or message policy.
        </p>
        <p>
          <strong>Unknowns.</strong> Decide whether speech output is wanted, which
          provider owns streaming, how consent and interruption work, and whether
          backend event subscriptions are safe to expose. The source snapshot does
          not answer those questions.
        </p>
        <p>
          <strong>Non-goals.</strong> This proposal does not add a native core
          assistant, an ACP sidecar, a hidden product policy, provider internals, or
          a claim about cross-thread delivery. It also does not turn the personal
          project foundation into an interaction-agent home by implication.
        </p>
        <Limits>
          <ul>
            <li>It does not prove a persistent dock, streaming voice, TTS, or global shortcut exists.</li>
            <li>It does not prove a plugin can observe every thread event or mutate a live provider session.</li>
            <li>Future proof would require rendered interaction states, focused voice tests, and source-tested event contracts.</li>
          </ul>
        </Limits>
        <EvidenceCallout
          kind="proposed"
          claim="Future acceptance would require a traceable plugin-owned session, explicit context consent, and separately measured voice behavior."
          explanation="Those are proof conditions for later work, not evidence that this blueprint has been implemented."
          sourceIds={['freshness-audit', 'interaction-guide']}
        />
      </PageSection>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
