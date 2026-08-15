import { defineDiagramDefinition, type SourceRecord } from '../schema'
import meta from './shell-and-navigation.meta'
import sources from './shell-and-navigation.sources.json'
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

const shellDiagram = defineDiagramDefinition({
  id: 'shell-route-ownership',
  title: 'One host shell, three workspace surfaces',
  caption: 'The global app prepares route and cross-route concerns before the layout hands the route body to the workspace surface.',
  evidenceMix: ['observed'],
  sourceIds: ['app-host', 'route-grammar', 'layout-owner', 'workspace-route'],
  code: `graph LR
  App[App] --> Routes[AppRoutes]
  Routes --> Layout[AppLayout]
  Layout --> Sidebar[Sidebar]
  Layout --> Workspace[Workspace route]
  Workspace --> Home[New-thread]
  Workspace --> Thread[Thread]
  Workspace --> Plugin[Plugin panel]`,
  textAlternative: 'The App is the outer host for cross-route concerns. It prepares route navigation, commands, theme synchronization, realtime invalidation, and plugin frontend boot before AppRoutes renders. AppRoutes places ordinary destinations under AppLayout. AppLayout selects the sidebar mode and supplies shared header and content inset. The wildcard workspace route then resolves one of three surfaces: the root new-thread composer, a project or thread view, or a plugin navigation panel. The sidebar sits beside these surfaces as host chrome. A plugin panel keeps the host title bar and navigation context while its body is plugin-owned. The diagram shows ownership flow, not a promise that every plugin panel is installed or available.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'App prepares cross-route behavior before the route body renders.',
          'The sidebar organizes threads but does not own the thread surface.',
          'A focused split pane can change the URL while other panes remain open.',
        ]}
      />

      <p>
        Read BB as a host around several work surfaces. The app shell handles shared
        concerns, the sidebar helps you move among work, and the route body shows a
        composer, thread, or extension panel. That separation matters when a control
        looks close to a plugin but is still owned by BB.
      </p>

      <DiagramCard definition={shellDiagram} />

      <PageSection id="who-owns-the-shell" title="Who owns the shell?">
        <p>
          <code>App</code> is more than a router. It establishes WebSocket invalidation,
          desktop theme synchronization, the stored palette, favicon state, plugin
          frontend boot, command handling, and route navigation before rendering
          <code>AppRoutes</code>. <code>AppRoutes</code> then puts Settings, project
          settings, Extensions/tools, and compatibility redirects on explicit routes.
        </p>
        <p>
          The wildcard route is the handoff point for ordinary work. It turns the URL
          into a new-thread, thread, or plugin-panel kind and gives that result to the
          split workspace. <code>AppLayout</code> chooses the app, settings, or tools
          sidebar, controls shared header chrome, loads sidebar data, and provides the
          content inset. A plugin panel receives that same host header while its body
          can use its own padding and scroll behavior.
        </p>
        <p>
          A useful ownership test is to ask which state must survive a route change.
          Theme, commands, realtime invalidation, and shared header behavior belong
          above the route. The current project, thread, or plugin subpath belongs to
          the route surface. This division keeps a plugin panel from quietly replacing
          global navigation and keeps a thread body from reconstructing sidebar rules.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The app and layout own cross-route chrome; the workspace route owns the current work surface."
          sourceIds={['app-host', 'route-grammar', 'layout-owner', 'workspace-route']}
        />
      </PageSection>

      <PageSection id="sidebar-switchboard" title="The sidebar is a work switchboard">
        <p>
          The sidebar is not only a list of recent threads. Its host-owned chrome
          provides new-thread and search controls, project and section navigation,
          thread selection, and footer actions. Project organization can be framed by
          project, machine, or manual choices, with pinning and sort modes represented
          in the navigation state. A plugin may replace the scrolling thread list on
          an experimental path, but the host keeps the surrounding controls and route
          semantics.
        </p>
        <p>
          This is why opening a thread does not mean leaving the sidebar model. The
          same navigation switchboard can select a project, jump to a thread, open a
          plugin row, or return to the composer. Treat the sidebar as the organizer and
          the route body as the active work surface.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="BB keeps new-thread, search, navigation, and footer chrome host-rendered around the thread list."
          sourceIds={['sidebar-owner']}
        />
      </PageSection>

      <PageSection id="focused-pane-and-aliases" title="The route follows the focused pane">
        <p>
          A thread can render as one pane or as a persisted split tree. When several
          panes exist, the focused pane is the one represented in the URL; the local
          layout may retain other open threads. Focus, close, maximize, reorder, and
          swap actions therefore affect both the local split tree and route state.
          Compact view, or a disabled split feature, falls back to a standalone thread
          surface rather than forcing a desktop-style multi-pane layout.
        </p>
        <p>
          Older tools and automation URLs are compatibility aliases. They redirect to
          current Settings, Extensions, or plugin destinations instead of creating a
          second product surface. Use the current destination when teaching the model;
          mention an alias only when helping someone follow an old link.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="The URL is the address of the focused work surface, not a complete dump of every open pane."
          explanation="This follows from the split tree updating the focused route while the local layout retains additional panes."
          basedOn={['split-pane', 'route-aliases']}
        />
      </PageSection>

      <Limits>
        Source inspection establishes ownership and state wiring, not the exact visual
        result, pixel breakpoints, animation timing, or whether a particular plugin is
        enabled on a given host. Those are rendered or configured states.
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
