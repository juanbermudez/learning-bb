import { defineDiagramDefinition, type SourceRecord } from '../schema'
import meta from './settings-and-extensions.meta'
import sources from './settings-and-extensions.sources.json'
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

const settingsExtensionsDiagram = defineDiagramDefinition({
  id: 'settings-extension-boundary',
  title: 'Host configuration and add-on surfaces meet in Extensions',
  caption: 'Settings keeps host configuration declarative while a plugin panel contributes body content inside host chrome.',
  evidenceMix: ['observed'],
  sourceIds: ['settings-nav', 'extensions-nav', 'plugin-slots', 'plugin-panel', 'plugin-header'],
  code: `graph LR
  Host[BB host] --> Settings[Settings]
  Host --> Extensions[Extensions]
  Settings --> Conditional[Conditional rows]
  Extensions --> Skills[Skills]
  Extensions --> Plugins[Plugins]
  Plugins --> Panel[Plugin panel]
  Panel --> Header[Host title bar]
  Panel --> Body[Plugin body]`,
  textAlternative: 'The BB host exposes two related management surfaces. Settings contains host configuration and conditionally adds provider, file, machine, experiment, or plugin rows. Extensions contains Skills and Plugins navigation, including browse, installed, detail, and management paths. A plugin navigation row opens a plugin panel route. The host keeps the sidebar row, route, shared title bar, icon, and containment boundary. The plugin owns the panel body and its internal padding or scroll. A plugin may also contribute settings sections, homepage content, composer actions, file openers, or thread actions through supported slots. The diagram does not mean every plugin, row, or slot exists on every installation.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Settings changes the host; Extensions manages skills and plugin capabilities.',
          'Rows and panels depend on daemon, provider, feature, and plugin state.',
          'A plugin can own panel content without owning global navigation or thread lifecycle.',
        ]}
      />

      <p>
        Keep the two surfaces distinct. Settings answers “how is this BB host
        configured?” Extensions answers “which add-on capabilities are available and
        managed?” A plugin may appear in both stories, but its presence does not make
        every plugin surface universal or move host responsibilities into the plugin.
      </p>

      <DiagramCard definition={settingsExtensionsDiagram} />

      <PageSection id="settings-is-conditional" title="Settings is conditional host configuration">
        <p>
          The Settings navigation defines built-in sections such as General, Appearance,
          Keyboard, Usage limits, Files, Machines, Updates, Experiments, Community, and
          archived threads. Provider entries are also part of the host navigation. The
          list is not a guarantee that every row is visible: Files depends on daemon
          and file-opener availability, and provider or machine choices depend on the
          current host configuration.
        </p>
        <p>
          Plugin settings are added only when an enabled plugin has configuration or a
          settings-section slot. The host supplies the Settings route and page chrome;
          the plugin contributes its bounded settings content. A missing row can mean
          “not configured here,” not “the feature was removed from BB.”
        </p>
        <p>
          This conditional model is useful when comparing screenshots or machines.
          Appearance and keyboard controls can exist for the host even when a provider
          row or Files section does not. The visible Settings list is consequently a
          report of current configuration, daemon state, and loaded extensions, not a
          complete promise of every capability described in a guide.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Settings navigation derives several rows from host and plugin availability instead of rendering one fixed list."
          sourceIds={['settings-nav', 'plugin-settings-slot']}
        />
      </PageSection>

      <PageSection id="extensions-owns-addons" title="Extensions organizes add-on capabilities">
        <p>
          Extensions uses Skills and Plugins sections with browse, owned or installed
          collections, detail routes, and actions such as enable, disable, remove, or
          open source. The navigation is host-owned even when the destination body is
          plugin-owned. Use the installed state shown by the host rather than assuming
          that an example plugin is present.
        </p>
        <p>
          Tasks, Docs, and Automations illustrate different plugin panels. Tasks can
          register a navigation panel and thread action; Docs can register a panel,
          file opener, and thread action; Automations is a current plugin navigation
          panel while older automation links remain compatibility aliases. These are
          examples of extension seams, not a promise that each installation has all
          three enabled.
        </p>
        <p>
          The practical distinction is between a catalog concept and a mounted surface.
          A plugin can be listed but disabled, compatible in the manifest but missing
          its frontend bundle, or present in the host while one panel is unavailable.
          Extensions gives the host a place to show and manage those states; it does
          not turn an absent panel into a current capability.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Extensions provides canonical Skills and Plugins navigation, while concrete plugin panels remain installation-dependent."
          sourceIds={['extensions-nav', 'tasks-surface', 'docs-surface', 'automations-surface']}
        />
      </PageSection>

      <PageSection id="host-and-plugin-boundary" title="The host and plugin share a boundary">
        <p>
          A navigation plugin contributes a row and opens a route such as a plugin
          panel. BB keeps the shared title bar, icon, route context, and per-plugin
          failure boundary. The panel body is full-bleed so the plugin can own its
          internal padding and scroll. Other supported slots add content to a homepage,
          Settings, a thread panel, the composer, a file tab, a message, or a pending
          interaction without replacing the host shell.
        </p>
        <p>
          Plugin frontend loading is asynchronous. A panel can be loading, disabled,
          removed, stale, incompatible, or failed and show an unavailable placeholder.
          Treat that placeholder as an honest host state. It is not evidence that the
          plugin’s body exists, nor a reason to describe every slot as always installed.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="Extensions are negotiated host surfaces, not a second global application shell."
          explanation="The host owns route and chrome while plugin registration supplies bounded body or action content."
          basedOn={['plugin-slots', 'plugin-panel', 'plugin-header', 'plugin-failure-boundary']}
        />
      </PageSection>

      <Limits>
        Source inspection does not establish which plugins are enabled on a particular
        host, whether a catalog item can be installed there, or how a plugin body looks
        after it renders. Those are configuration and rendered states.
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
