import { defineDiagramDefinition, type SourceRecord } from '../schema'
import meta from './start-a-thread.meta'
import sources from './start-a-thread.sources.json'
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

const newThreadDiagram = defineDiagramDefinition({
  id: 'new-thread-control-path',
  title: 'The home route assembles a thread request',
  caption: 'BB keeps project, execution, and prompt input as separate host-owned parts of starting work.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['empty-welcome', 'submit-new-thread', 'execution-controls', 'prompt-box'],
  code: `graph LR
  Welcome[Empty welcome] --> Project[Project]
  Project --> Controls[Execution controls]
  Controls --> Place[Environment]
  Place --> Composer[Prompt composer]
  Composer --> Thread[Thread route]
  Controls -. optional .-> Provider[Provider and model]`,
  textAlternative: 'The empty welcome can lead to a new thread, project creation, project import, or learning content when no project is available. A selected project feeds the execution controls. Those controls represent provider, model, service tier, reasoning, permission, and plugin preset state when the host has the required data. Environment selection is adjacent but distinct: it chooses a local or remote source, host, worktree, and branch context. The prompt composer then collects text, mentions, attachments, and other input. Submitting validates the selected project, provider, model, and environment before creating or forking a thread and navigating to its thread route. The provider/model branch is conditional, so an unavailable option is not a hidden default.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Home is a new-thread surface, not an empty version of the timeline.',
          'Execution choice and work location are neighboring but different controls.',
          'Unavailable provider, host, source, or plugin state can remove a choice.',
        ]}
      />

      <p>
        Starting work in BB is a small assembly process. The host first establishes a
        project and execution context, then collects a structured prompt. The browser
        presents those choices; it does not become the agent runtime or provider just
        because the composer is visible.
      </p>

      <DiagramCard definition={newThreadDiagram} />

      <PageSection id="empty-home" title="Home starts with a state, not a transcript">
        <p>
          The root route is interpreted as a new-thread surface. When no project is
          available, the empty welcome offers actions such as starting a thread,
          creating a project, importing projects, or learning what BB can do. That is
          an onboarding state owned by the host, not a plugin panel and not a missing
          timeline.
        </p>
        <p>
          Once a project is selected, the home view owns the submit path. It validates
          the project, provider, model, and environment, builds the new or forked
          request, and navigates to the resulting thread. The route change is the
          boundary between configuring work and reading its timeline.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="RootComposeView owns the new-thread submit flow and passes the selected execution and environment configuration into the composer."
          sourceIds={['empty-welcome', 'submit-new-thread', 'home-config']}
        />
      </PageSection>

      <PageSection id="choices-before-send" title="Choose what runs and where">
        <p>
          Execution controls describe the agent choice: provider, model, service tier,
          reasoning, permission, and any host-supported preset. The controls only show
          model or reasoning choices when provider/model data exists, and the host can
          mark a choice disabled or read-only. A plugin preset may add an option, but it
          cannot manufacture an unavailable provider.
        </p>
        <p>
          Environment controls answer a different question: where should this work
          use a source and workspace? The picker distinguishes local and remote work,
          host and source availability, new or existing worktrees, and branch choice.
          A reusable worktree carries host and branch context rather than becoming a
          second model selector. Keep the two groups separate when diagnosing a missing
          control.
        </p>
        <p>
          The selected environment is also part of the request’s meaning. A local
          source, remote source, existing worktree, and new worktree can lead to
          different host or branch choices. If a source or daemon is unavailable, the
          honest UI state is an unavailable option or a read-only explanation. It is
          not a reason to substitute the browser machine silently or imply that the
          provider will run somewhere else.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Provider/model availability and environment/source availability are separate data and failure states."
          sourceIds={['execution-controls', 'environment-picker', 'worktree-picker']}
        />
      </PageSection>

      <PageSection id="composer-and-availability" title="The composer gathers the request">
        <p>
          The prompt box is a structured editor, not only a text field. It supports
          mentions, command or slash completion, attachments, drag and drop, history,
          voice, zen mode, and run, stop, or send controls. Plugin composer actions can
          appear inline or in an overflow menu, while the host keeps the native editor
          and submission mechanics.
        </p>
        <p>
          A mention can carry context that is resolved at send time. If a plugin
          mention cannot resolve, the send is blocked rather than silently turning the
          mention into empty context. Attachment references are validated and staged
          into confined per-thread storage before the host daemon passes them to the
          runtime. The visible pill or optimistic draft therefore is not proof that
          every hidden input has reached the provider.
        </p>
        <p>
          That boundary also explains why the composer can feel ready before execution
          is accepted. The editor owns a draft and visible affordances; the server
          checks the target thread, resolves plugin context, validates attachment
          references, and records accepted intent. A failed check should return an
          error or unavailable state rather than silently changing the project,
          provider, branch, or worktree underneath the user. The visible controls are
          therefore useful evidence of current choices, but not proof that a runtime
          process has started or that provider output is already available.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="The composer is a control surface for assembling a request, while the server remains the authority for accepted input."
          explanation="The editor exposes input affordances, but mention resolution, attachment validation, and final request creation occur at the send boundary."
          basedOn={['prompt-box', 'prompt-input', 'plugin-mentions', 'attachment-staging']}
        />
      </PageSection>

      <Limits>
        Source evidence does not prove a particular provider list, voice backend,
        editor focus result, host connection, or rendered placement. Those states vary
        with configuration, feature flags, host availability, and plugin installation.
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
