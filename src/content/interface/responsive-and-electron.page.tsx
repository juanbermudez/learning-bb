import { defineDiagramDefinition, type SourceRecord } from '../schema'
import meta from './responsive-and-electron.meta'
import sources from './responsive-and-electron.sources.json'
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

const hostBoundaryDiagram = defineDiagramDefinition({
  id: 'responsive-host-boundary',
  title: 'Responsive web and Electron share a shell, not every capability',
  caption: 'Compact layout changes panel geometry; Electron additionally supplies a native browser view through a host API.',
  evidenceMix: ['observed', 'inference', 'unknown'],
  sourceIds: ['host-responsive', 'secondary-responsive', 'split-fallback', 'web-browser-state', 'electron-browser'],
  code: `graph LR
  Viewport[Viewport state] --> Wide[Wide aside]
  Viewport --> Compact[Compact drawer]
  Compact --> Standalone[Standalone thread]
  Web[Browser host] --> Unavailable[Browser unavailable]
  Electron[Electron host] --> Native[Native browser view]
  Native --> Policy[Host policy]`,
  textAlternative: 'The host measures viewport and panel state to choose a wide aside or compact drawer. When the viewport is compact, split-thread realization can fall back to a standalone thread surface. Plugin interiors have their own container rules, so their drawer thresholds are not the host breakpoint. Browser capability is a separate branch. In ordinary web mode, the absence of the desktop browser API means no native in-panel view is attached and the UI can show an unavailable state. Electron exposes a validated browser API through preload to a native WebContentsView. The desktop browser remains subject to host policy and permissions. A mobile-width web page therefore shares responsive layout ideas with desktop BB but does not prove native mobile runtime support.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Compact web layout is a drawer strategy, not a native mobile runtime.',
          'Host and plugin interiors measure different containers and own different fallbacks.',
          'Electron adds a native browser capability that ordinary web mode may not have.',
        ]}
      />

      <p>
        “Responsive” describes how a host rearranges its interface; it does not answer
        which capabilities the host can execute. BB keeps those questions separate:
        compact web can preserve a thread surface with drawers, while Electron can add
        native browser integration through a desktop-only boundary.
      </p>

      <DiagramCard definition={hostBoundaryDiagram} />

      <PageSection id="host-drawer-and-plugin-drawer" title="Host drawers and plugin drawers are different">
        <p>
          The host uses compact viewport state and visual-viewport measurements to turn
          app and section sidebars into drawers. Secondary thread content makes a
          similar wide-aside or compact-drawer choice. The host keeps the drawer state,
          focus behavior, and panel ownership; a plugin panel does not redefine that
          outer shell.
        </p>
        <p>
          The distinction also applies to focus and scroll ownership. The host decides
          when a drawer is open and which surface receives focus, while a plugin can
          decide how its own panel body scrolls after it is mounted. A narrow plugin
          sidebar is therefore evidence about that plugin’s container, not a shortcut
          for inferring the app’s viewport state.
        </p>
        <p>
          A plugin can then measure its own interior. Tasks uses container thresholds for
          its sidebar and board, while Docs uses a pane-width threshold for its notes
          sidebar. Those rules belong to the plugin body and must not be presented as
          the universal BB breakpoint. Exact host geometry and animation timing remain
          a rendered question in the source report.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="There is no single source-established pixel breakpoint that describes every responsive BB surface."
          explanation="The host and installed plugins measure different containers, and the UI research was source-only rather than a browser render."
          sourceIds={['host-responsive', 'plugin-responsive', 'docs-responsive']}
        />
      </PageSection>

      <PageSection id="split-panes-have-fallback" title="Split panes have a compact fallback">
        <p>
          Desktop split panes support focus, close, maximize, reorder, move, and swap
          behavior through a persisted split tree. Compact view deliberately avoids
          realizing the same multi-pane arrangement and renders a standalone thread
          path instead. One pane remains equivalent to that standalone path, so the
          fallback is a change in layout density rather than a second thread model.
        </p>
        <p>
          The focused pane can still be reflected in the URL when split behavior is
          available. On a narrow viewport, teach the reader to expect one active thread
          surface and a way to open secondary content, not a miniature desktop window
          with every pane visible at once.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Compact view or a disabled split feature reduces the thread area to a standalone surface."
          sourceIds={['split-fallback']}
        />
      </PageSection>

      <PageSection id="browser-capabilities-by-host" title="Browser capability depends on the host">
        <p>
          In web mode, BB checks for <code>window.bbDesktop?.browser</code>. When the
          API is absent, the renderer does not attach a native browser view and the
          interface can explain that the capability is unavailable. “Browser” here
          means an in-app tab surface, not the user’s ordinary browser session or its
          cookies.
        </p>
        <p>
          The unavailable web state is meaningful. It tells the reader that the
          renderer can show the panel’s place and controls, but the native browser
          attachment requires a desktop host API. It does not mean ordinary web
          navigation has become an embedded browser, nor that a mobile-width browser
          has acquired Electron’s permissions or persistence model.
        </p>
        <p>
          Electron exposes a validated browser API through preload. The main process
          creates and bounds a native <code>WebContentsView</code>, retains views per
          tab, and limits top-level navigation to HTTP(S). Popups become in-panel tabs,
          and the permission path allows sanitized clipboard write while denying
          clipboard read and other device permissions. These are desktop host policies,
          not guarantees of a live provider or a native mobile app.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="A compact browser layout and an Electron native browser are separate proof surfaces."
          explanation="The same thread UI can render in web mode while only Electron supplies the native browser attachment and desktop permission policy."
          basedOn={['web-browser-state', 'electron-browser', 'browser-policy']}
        />
      </PageSection>

      <Limits>
        Source inspection does not prove exact breakpoint geometry, native attachment
        success on a particular machine, existing browser cookies, mobile runtime
        support, provider availability, or rendered keyboard behavior.
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
