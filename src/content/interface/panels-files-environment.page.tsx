import { defineDiagramDefinition, type SourceRecord } from '../schema'
import meta from './panels-files-environment.meta'
import sources from './panels-files-environment.sources.json'
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

const secondaryPanelDiagram = defineDiagramDefinition({
  id: 'secondary-panel-views',
  title: 'The secondary panel reads context beside the thread',
  caption: 'A fixed panel selects one secondary view while separate environment queries supply file and diff data.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['secondary-panel', 'panel-content', 'tab-content'],
  code: `graph LR
  Thread[Thread history] --> Panel[Secondary panel]
  Panel --> Info[Info]
  Panel --> Diff[Diff]
  Panel --> Files[Files]
  Panel --> Browser[Browser]
  Panel --> Terminal[Terminal]
  Panel --> Queries[Environment queries]
  Queries --> Ready[Available]
  Queries --> Missing[Unavailable]`,
  textAlternative: 'The thread history remains the primary reading surface. A secondary panel sits beside it and resolves one active fixed panel kind at a time. The visible choices include thread information, Git diff, workspace or host files, browser, terminal, plugin content, and a new tab. File previews and diff patches come from separate environment, project, host, or storage queries rather than being embedded in the timeline. Those queries can return usable content or an unavailable/loading state. In wide mode the panel is a resizable aside; in compact mode it becomes a drawer. The final unavailable branch means the thread may still be readable even when the selected environment or file source is not.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The secondary panel adds context beside a thread; it does not replace timeline history.',
          'Wide mode uses an aside, while compact mode uses a drawer.',
          'Environment and file failures can limit panels without erasing saved thread history.',
        ]}
      />

      <p>
        Use the right panel when the thread needs a neighboring work surface. BB keeps
        thread history and secondary content as related but separate views: the thread
        explains the conversation and work, while the panel exposes the selected file,
        diff, browser, terminal, plugin, or context detail.
      </p>

      <DiagramCard definition={secondaryPanelDiagram} />

      <PageSection id="one-thread-many-views" title="One thread, many secondary views">
        <p>
          The secondary panel resolves one active fixed panel kind. Its toolbar can
          expose thread information, Git diff, file tabs, browser, terminal, plugin
          content, and a new-tab surface. The new-tab view makes file search primary
          and offers browser, terminal, or plugin actions as additional destinations.
          These are panel choices inside the thread context, not unrelated routes.
        </p>
        <p>
          File and diff content is loaded on demand. Separate queries ask for metadata
          and content from environment, project, host, or thread storage, and diff
          patches are fetched when a file is selected. A timeline row can point to a
          file change, but the panel owns the richer preview and navigation state.
        </p>
        <p>
          The active tab is therefore a view choice, not a second source of thread
          truth. Opening Diff can change the selected comparison; opening a file can
          add a tab; opening a terminal or browser can add a live panel surface. The
          thread remains the place to understand the request and its status, while the
          secondary panel supplies context for acting on that work.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The secondary panel owns Info, Diff, file, browser, terminal, plugin, and new-tab views with separate file and diff queries."
          sourceIds={['secondary-panel', 'panel-toolbar', 'tab-content', 'new-tab']}
        />
      </PageSection>

      <PageSection id="wide-aside-compact-drawer" title="Wide aside, compact drawer">
        <p>
          In a wide layout, the panel is a resizable aside beside the timeline. The
          source describes a bounded panel share and controls for file tabs, new tabs,
          and collapse. In a compact layout, the same secondary content settles into a
          drawer instead of shrinking the thread into an unusable split.
        </p>
        <p>
          The compact path also matters for the in-app browser. BB waits for the drawer
          to settle before realizing a native browser view, which keeps a native view
          from being attached to stale geometry. This is a host behavior; a plugin may
          add a panel body but does not decide the host’s panel ownership.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The source does not establish one universal pixel breakpoint for every host panel."
          explanation="Compact behavior is driven by measured viewport and container state, while plugin panels can have their own responsive rules."
          sourceIds={['panel-content', 'secondary-panel']}
        />
      </PageSection>

      <PageSection id="history-and-availability" title="History can outlive the environment">
        <p>
          Environment controls distinguish local and remote sources, hosts, work
          location, new or existing worktrees, and branch context. The selected
          environment is reused by the new-thread controls and refreshed through
          environment and work-status queries. A missing host or source therefore
          changes what can be opened or started; it is not silently treated as a local
          workspace.
        </p>
        <p>
          The separation also explains a common state: a thread remains readable while
          its environment is unavailable, a file preview is loading, or a diff cannot
          be fetched. The detail view can make the thread read-only in that condition.
          Saved history and current execution ability are different parts of the
          interface.
        </p>
        <p>
          This separation is especially useful when moving between machines. A thread
          can point at a remote environment whose host is disconnected, or at a source
          whose file query cannot complete, without becoming a new local project. Read
          the environment and worktree labels as current context, then read the panel
          state as the result of a separate query. Do not infer a successful file
          operation from the existence of a timeline row alone.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="A readable thread does not prove that its current workspace or file source is available."
          explanation="Thread history and secondary queries have separate owners and failure states."
          basedOn={['tab-content', 'environment-picker', 'thread-read-only']}
        />
      </PageSection>

      <Limits>
        Source inspection does not prove a particular file’s permissions, provider
        session, browser attachment, rendered drawer width, or the availability of a
        selected remote host at runtime.
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
