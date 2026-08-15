import { defineDiagramDefinition, type SourceRecord } from '../schema'
import meta from './timeline-and-follow-up.meta'
import sources from './timeline-and-follow-up.sources.json'
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

const pageSources = sources as unknown as readonly SourceRecord[]

const threadControlDiagram = defineDiagramDefinition({
  id: 'thread-control-surface',
  title: 'A thread has a timeline and a control area',
  caption: 'The header, rows, pending interaction state, and follow-up controls form one host-owned thread surface.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['timeline-content', 'timeline-surface', 'thread-header', 'prompt-area'],
  code: `graph TD
  Header[Thread header] --> Timeline[Timeline rows]
  Timeline --> Expand[Expandable work row]
  Timeline --> Question[Question or approval]
  Timeline --> Older[Load older rows]
  Timeline --> Follow[Follow-up area]
  Follow --> Queue[Queue]
  Follow --> Stop[Stop]
  Follow --> Send[Submit]`,
  textAlternative: 'The thread header sits above the timeline and owns title, workspace, panel, and pane actions. The timeline surface renders loading, connection, activity, and row states. A row can expand to show work detail, while the surface can load older rows. Questions and approvals are active interaction states, not ordinary transcript text. The lower follow-up area receives the current thread status and chooses a pending-interaction composer, a queueable follow-up, a stop action, or a normal submit. Queue and stop are sibling controls with different meanings: queue records work for later execution, while stop asks the active run to halt. The host keeps ordering and status semantics across all branches.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Rows represent work and lifecycle state, not only assistant prose.',
          'Questions and approvals turn the lower area into an interaction surface.',
          'Follow-up mode depends on host status: submit, queue, stop, or wait.',
        ]}
      />

      <p>
        A thread is where BB shows what happened and where you decide what happens
        next. The timeline is the reading surface, but the header, pending cards, and
        lower prompt area make the whole thread an active control surface. A row can be
        collapsed for a summary, expanded for work detail, or held open while the host
        waits for a response.
      </p>

      <DiagramCard definition={threadControlDiagram} />

      <PageSection id="rows-are-state" title="Rows are state, not just messages">
        <p>
          The timeline controller handles loading, missing-thread, and error states,
          then renders the timeline surface with active thinking, background work, and
          provisioning indicators. The surface can add a visible “Stop requested” row,
          load older pages, and show host connection notices. That means a quiet-looking
          thread may still be waiting on host state, while a row with work detail may
          be expanded independently of the current run.
        </p>
        <p>
          Row mapping covers conversation, bundle, step, turn, work, delegation,
          system, file-change, command, tool, web, workflow, approval, question,
          provisioning, interruption, compaction, and context-clear events. Completed
          rows can be visually dimmed while running and error states keep emphasis.
          Expandable rows support keyboard activation as well as pointer interaction.
        </p>
        <p>
          Read row emphasis as a status cue, not a ranking of which work mattered more.
          A completed row may recede visually while an error stays prominent because
          the host is asking for attention. The timeline can preserve conversation
          rows alongside operational rows, so the reader can connect a prompt with the
          work it triggered without treating every row as provider output.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The host timeline owns row ordering, expansion behavior, loading states, and status emphasis."
          sourceIds={['timeline-content', 'timeline-surface', 'timeline-rows', 'expandable-row']}
        />
      </PageSection>

      <PageSection id="questions-and-approvals" title="Questions and approvals pause the control surface">
        <p>
          Questions and approvals are not merely special-looking messages. The thread
          prompt area can replace its normal follow-up box with a pending interaction
          composer, while the timeline and header continue to show the surrounding
          thread state. The same lower region can also expose workflow, background,
          plan, goal, todo, or context banners, so “there is a text box” does not mean
          a normal send is currently allowed.
        </p>
        <p>
          The safe reading is to follow the control state presented by the host. If a
          question or approval is pending, answer or cancel that interaction first.
          Do not assume that typing a follow-up will bypass it, or that a plugin card
          owns the thread’s lifecycle. Plugin pending interactions can add the form,
          but host ordering, cancellation, and status remain the boundary.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Pending interactions can replace the normal composer and block an ordinary follow-up path."
          sourceIds={['prompt-area', 'prompt-interaction-state', 'follow-up-submission']}
        />
      </PageSection>

      <PageSection id="continue-or-stop" title="Continue, queue, or stop">
        <p>
          Follow-up submission chooses among normal submit, queue, and stop modes from
          the current display status. Active, host-reconnecting, provisioning, starting,
          and waiting-for-host states are queueable in the inspected path. Stop requests,
          pending interactions, and loading execution options block a normal send until
          the host resolves the condition. A queued prompt is therefore an explicit
          state, not evidence that provider work has already begun.
        </p>
        <p>
          The thread header adds rename, archive, workspace, panel, and pane actions;
          the lower area adds the run-control decision. If the environment disappears,
          the thread can become read-only while its saved history remains visible. This
          is why the timeline can outlive the ability to launch new work in that context.
        </p>
        <p>
          Queue is therefore a host status, not a visual synonym for “running.” A
          queued prompt can wait for an active turn, a reconnecting host, provisioning,
          or another guarded state. Stop is a different command path, and a pending
          question can take priority over both. The labels in the lower area tell you
          which transition the host will attempt next.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="The visible thread combines a durable reading surface with a status-gated command surface."
          explanation="The timeline can remain readable while the prompt area changes mode or becomes read-only, so transcript access and execution ability are separate states."
          basedOn={['timeline-projection', 'prompt-area', 'thread-read-only', 'follow-up-submission']}
        />
      </PageSection>

      <Limits>
        The source snapshot does not establish provider output semantics, exact rendered
        row appearance, latency, or whether a particular question, approval, or host
        connection is present in a live thread.
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
