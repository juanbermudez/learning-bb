import meta from './ui-surface-atlas.meta'
import sources from './ui-surface-atlas.sources.json'
import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
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
} from '../../components/content'

export { meta }

const typedSources = sources as readonly SourceRecord[]

const surfaceDiagram = defineDiagramDefinition({
  id: 'plugin-surface-groups',
  title: 'Plugin surfaces attach to host anatomy in two groups',
  caption:
    'Observed: stable slots add bounded content, while experimental slots reach replacement-shaped areas with explicit host limits.',
  evidenceMix: ['observed'],
  sourceIds: ['stable-slot-contract', 'stable-composer', 'exp-slot-contract', 'exp-composer'],
  code: `flowchart LR
  host["BB host shell"] --> stable["Stable slots"]
  host --> experimental["Experimental slots"]
  stable --> home["Home / settings"]
  stable --> thread["Thread / composer"]
  stable --> files["Files / messages"]
  experimental --> list["Replacement thread list"]
  experimental --> composer["New composer / model tab"]
  experimental --> header["Header / sidebar extras"]`,
  textAlternative:
    'Observed: the host shell is the parent boundary. Stable slots branch into homepage and settings sections, navigation panels, thread and composer additions, file openers, message rendering, and host hooks. Experimental slots branch into a sidebar accessory, new-thread panel action, replacement thread list, thread-header action, row status treatment, model-selector tab, complete new-thread composer, file preview, sidebar integrations, and status labels. The grouping is a contract distinction, not a visual quality ranking. Every branch still has a host-owned route, shell, state, or cleanup limit.',
})

const anatomyDiagram = defineDiagramDefinition({
  id: 'plugin-host-anatomy',
  title: 'A plugin can fill a surface without owning its frame',
  caption:
    'Observed: BB supplies navigation, title bars, action containers, and lifecycle boundaries around plugin-owned content.',
  evidenceMix: ['observed'],
  sourceIds: ['nav-panel-host', 'panel-host', 'composer-host', 'slot-boundary'],
  code: `flowchart TD
  sidebar["Host sidebar"] --> nav["Stable navPanel"]
  sidebar --> accessory["Experimental accessory"]
  thread["Thread surface"] --> panel["Stable panel action"]
  thread --> header["Experimental header action"]
  composer["Host composer"] --> action["Stable composer actions"]
  composer --> replacement["Experimental new composer"]
  host["Host chrome"] --> body["Plugin-owned body"]`,
  textAlternative:
    'Observed: a navigation plugin contributes a panel body while BB retains the sidebar row, route, title bar, and navigation chrome. A thread-panel action is placed inside a host-owned action container. A composer action appears inside the native composer, while an experimental new-thread composer still receives host execution choices and must create the thread through its submit contract. The plugin-owned body can control its own padding and scroll where the host says so. Error boundaries and generation cleanup remain host responsibilities around each mounted surface.',
})

function status(kind: 'observed' | 'unknown', text: string, sourceId: string) {
  return (
    <>
      <EvidenceBadge label={kind} /> {text} · <code>{sourceId}</code>
    </>
  )
}

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Stable slots add content around host-owned routes, chrome, state, and lifecycle.',
          'Experimental slots are explicit contracts, not equivalent replacements for the native interface.',
          'Every surface has a visible host limit: frame, state, navigation, or fallback.',
        ]}
      />

      <p>
        A slot answers two questions: where can a plugin appear, and what does BB keep
        around it? Stable slots are additive seams for content and actions. Experimental
        slots reach more sensitive surfaces, including a replacement thread list and a
        complete new-thread composer. The tables below use the same rule for both:
        contribution and host-owned limit must be read together.
      </p>

      <DiagramCard definition={surfaceDiagram} />
      <DiagramCard definition={anatomyDiagram} />

      <PageSection id="stable-slots" title="Stable slots add bounded content">
        <p>
          Stable does not mean “owns the page.” A homepage section sits below the host
          compose area. A navigation panel gets a route body, but BB keeps its sidebar
          row and title bar. Composer customizations add actions, banners, plus-menu
          rows, or paint-only rich-text effects while the native editor and submit state
          remain host-owned. The same pattern covers messages, file openers, pending
          interactions, and reusable host-rendered components.
        </p>
        <DataTable
          caption="All stable UI extension surfaces and the host boundary beside each one."
          headers={['Stable surface', 'Visible location', 'Plugin contribution', 'Host-owned limit', 'Status / source']}
          rows={[
            ['homepageSection', 'Project homepage below host compose', 'Titled plugin section or component', 'Homepage route, shell, and project navigation', status('observed', 'Stable', 'stable-slot-contract')],
            ['settingsSection', 'Plugin detail page below host settings form', 'Plugin settings UI', 'Settings route, form, and page chrome', status('observed', 'Stable', 'stable-slot-contract')],
            ['navPanel', 'Plugin route body at `/plugins/<id>/<path>/*`', 'Full route content', 'Sidebar row, route, shared title bar, navigation chrome', status('observed', 'Stable', 'stable-slot-contract')],
            ['navPanel.headerContent', 'Right side of shared plugin title bar', 'Small header contribution', 'Title/icon, containment, and title-bar layout', status('observed', 'Stable', 'stable-slot-contract')],
            ['threadPanelAction', 'Existing-thread secondary-panel Actions list and tab', 'Action label, icon, run behavior, tab component', 'Thread ownership, panel shell, persisted params, tab framing', status('observed', 'Stable', 'stable-slot-contract')],
            ['pendingInteraction', 'Composer while `requestInput` is pending', 'Form/view that submits or cancels', 'Interaction shell, disabled fieldset, cancel fallback', status('observed', 'Stable', 'stable-slot-contract')],
            ['sidebarFooterAction', 'Sidebar footer after Settings and before bug report', 'Host-rendered icon action and optional settings opener', 'Button chrome, footer order, error containment', status('observed', 'Stable', 'stable-slot-contract')],
            ['fileOpener', 'Selected file as plugin panel or tab', 'File-specific UI for declared extensions', 'Selection/default routing; git-ref snapshots use builtin fallback', status('observed', 'Stable', 'stable-file-message')],
            ['messageDirective', 'Assistant or nested message Markdown leaf', 'Recognized directive from untrusted attrs/source', 'User text, code fences, file previews, Markdown shell', status('observed', 'Stable', 'stable-file-message')],
            ['messageAction', 'Per-message action bar and assistant-selection menu', 'Action component/callback; may open a plugin panel', 'Message chrome, selection menu, message lifecycle', status('observed', 'Stable', 'stable-file-message')],
            ['contentScripts', 'Same-origin script mount; no React slot', 'DOM additions or observation for declared scripts', 'Host abort/disposer, generation, failure containment', status('observed', 'Stable', 'stable-content-scripts')],
            ['composer customize.actions', 'Inline composer action row before voice/submit; overflow in More', 'Up to three plugin groups inline, then host overflow', 'Composer shell, native controls, compact behavior, layout', status('observed', 'Stable', 'stable-composer')],
            ['composer customize.banners', 'Above the native measured composer stack', 'Card or bare banner content', 'Native stack measurement and composer shell', status('observed', 'Stable', 'stable-composer')],
            ['composer customize.plusMenu', 'Host row in composer plus menu', 'Menu action using composer/view context', 'Menu chrome and row placement', status('observed', 'Stable', 'stable-composer')],
            ['composer customize.richText', 'Inside editor decoration/rendering path', 'Paint-only effects and read-only debounced draft observation', 'Text mutation, selection ownership, editor state', status('observed', 'Stable', 'stable-rich-text')],
            ['ThreadChat', 'Host thread conversation inside a plugin panel', 'Reusable full/compact/timeline conversation and message actions', 'Provider internals, timeline/query/prompt config, thread lifecycle', status('observed', 'Stable', 'stable-thread-chat')],
            ['Markdown', 'Host Markdown body inside plugin UI', 'Safe Markdown content and optional class', 'Host renderer, options, and chrome', status('observed', 'Stable', 'stable-markdown')],
            ['Stable hooks', 'Mounted plugin subtree; no extra visual slot', 'RPC, realtime, settings, BB context/navigation, composer/view interactions', 'Host caches, routes, auth, provider state, and lifecycle', status('observed', 'Stable', 'stable-hooks')],
          ]}
        />
        <EvidenceCallout
          kind="observed"
          claim="The stable API is additive around host-owned interface state."
          explanation="Even a full route body, message action, or composer customization arrives through a host frame and host lifecycle."
          sourceIds={['stable-slot-contract', 'stable-file-message', 'stable-composer', 'stable-thread-chat', 'stable-hooks']}
        />
        <p>
          The stable rows form three useful families. Home, settings, and navigation
          slots add destinations or configuration without changing route ownership.
          Thread, message, file, and composer slots add work-specific content inside
          host-managed state. ThreadChat, Markdown, and hooks let a plugin reuse host
          behavior without receiving the caches, authentication, provider state, or
          lifecycle behind that behavior. The contribution is visible, but its frame is
          still a BB frame.
        </p>
      </PageSection>

      <PageSection id="experimental-slots" title="Experimental slots expose sharper tradeoffs">
        <p>
          Experimental surfaces are not missing documentation; they are a separate risk
          tier. The replacement thread list can own scrolling rows and keyboard handling,
          but BB still owns new-thread, search, route semantics, and footer chrome. The
          new-thread composer can own the initial prompt UI, but it does not own provider,
          model, or reasoning selection and must create the thread through the host
          request. Experimental hooks can read host state or invoke host actions, while
          dialogs, drag rules, and split limits remain outside the plugin.
        </p>
        <DataTable
          caption="All experimental UI surfaces and the sharper host boundary beside each one."
          headers={['Experimental surface', 'Visible location', 'Plugin contribution', 'Host-owned limit', 'Status / source']}
          rows={[
            ['navPanel.experimental_sidebarAccessory', 'Trailing accessory in a wide plugin-sidebar row', 'Small accessory control', 'Row hit target/chrome; bounded about 4rem × 1.25rem; omitted on narrow viewports', status('observed', 'Experimental', 'exp-slot-contract')],
            ['experimental_newThreadPanelAction', 'Secondary-panel Actions list for a new thread', 'New-thread action or tab content', 'New-thread/thread-creation shell and tab framing', status('observed', 'Experimental', 'exp-slot-contract')],
            ['experimental_threadList', 'Scrolling sidebar thread list', 'Exclusive replacement list, keyboard navigation, filtering UI', 'New-thread button, host search state, route/navigation semantics, footer; builtin list fallback on crash', status('observed', 'Experimental', 'exp-slot-contract')],
            ['experimental_threadHeaderAction', 'Per-pane thread-header action row', 'Small action component', 'Header order/row at 48px, labels, pane controls, maximum dimensions', status('observed', 'Experimental', 'exp-slot-contract')],
            ['experimental_setThreadRowStatus', 'Rows when a replacement thread list is mounted', 'Generation-owned status label/icon', 'Host row ownership and cleanup; status clears on dispose', status('observed', 'Experimental', 'exp-status')],
            ['experimental_modelSelectorTab', 'Tab in host composer model selector', 'Preset-selection UI', 'Provider/model/reasoning state, available providers, tab close', status('observed', 'Experimental', 'exp-model-tab')],
            ['experimental_NewThreadComposer', 'Complete new-thread composer surface', 'Initial prompt, draft, and submission UI', 'Host provider/model/reasoning selection; plugin must create the thread on submit', status('observed', 'Experimental', 'exp-composer')],
            ['experimental_FilePreview', 'Text-only file body in plugin-owned panel', 'Text, Markdown, or CSV preview', 'Host syntax/Markdown/CSV body and surrounding chrome; binaries are plugin-side', status('observed', 'Experimental', 'exp-file-preview')],
            ['Experimental sidebar hooks', 'Replacement-list/sidebar integrations', 'Read sidebar state and invoke host navigation/archive/delete/PR/split actions', 'Host state mutations, dialogs, drag rules, and split cap', status('observed', 'Experimental', 'exp-sidebar-hooks')],
            ['bb.agents.experimental_statusLabels', 'No fixed location; metadata consumed by agent UI', 'Agent/tool status-label metadata', 'Host rendering and session lifecycle', status('observed', 'Experimental', 'exp-status-labels')],
          ]}
        />
        <EvidenceCallout
          kind="observed"
          claim="Experimental means a documented sharper seam, not a stable replacement contract for the whole host."
          explanation="The replacement list, new composer, model tab, and sidebar hooks each leave route, selection, state, or cleanup authority with BB."
          sourceIds={['exp-slot-contract', 'exp-model-tab', 'exp-composer', 'exp-sidebar-hooks', 'exp-status-labels']}
        />
        <p>
          The host limit is the practical difference. A replacement list may draw rows,
          but it still receives the host search state and navigation callbacks. A model
          selector tab can offer a preset, but it cannot make an unavailable provider
          appear. A new-thread composer may own the draft view, but the submit contract
          still crosses host thread creation. Experimental status is therefore a reason
          to read the fallback and ownership columns carefully, not a license to infer
          a general replacement API.
        </p>
      </PageSection>

      <PageSection id="host-anatomy" title="The host anatomy is the invariant">
        <p>
          A plugin navigation row can be reordered or placed under a “More” affordance,
          but the route still resolves through the host. The shared title bar keeps the
          title, icon, containment, and optional header content. The plugin panel body is
          full-bleed so the plugin can own its internal padding and scroll; that does not
          transfer the outer chrome or error boundary. The same ownership rule applies to
          sidebars, action tabs, and the native composer.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="The safest way to read a slot is contribution inside a host-owned frame."
          explanation="This inference combines the slot contracts with the host panel/header and sidebar anatomy; it is a teaching model, not a new SDK capability."
          basedOn={['nav-panel-host', 'panel-host', 'composer-host']}
        />
        <p>
          Host configuration also matters. Settings rows, plugin panels, provider
          controls, and machine-dependent surfaces can be conditional. A static page can
          map the contract, but it cannot promise that a particular enabled plugin, host
          daemon, feature flag, or provider configuration will expose every row. Read
          “stable” and “experimental” as API status, not as proof that a surface is live
          in every deployment.
        </p>
        <p>
          Inner plugin layout has its own measurements too. The observed Tasks panel
          collapses its internal sidebar below 720px and makes boards unusable below
          448px; Docs uses a 640px pane threshold. Those are plugin-owned container
          rules, not the host app’s compact breakpoint. A host can provide a full-bleed
          panel while the plugin decides how its own children reflow inside that panel.
        </p>
      </PageSection>

      <Limits>
        <ul>
          <li>Stable and experimental slots do not grant direct provider/model access, host-database access, or global shell ownership.</li>
          <li>Content scripts and imported CSS have separate trust and reach rules; slot mounting is not a security sandbox.</li>
          <li>No browser render, authenticated live session, provider call, or deployed-plugin check was performed.</li>
        </ul>
      </Limits>

      <EvidenceCallout
        kind="unknown"
        claim="Exact pixel geometry and availability for a plugin surface in a particular host are Unknown here."
        explanation="R03 records conditional configuration and container-aware behavior, but this page has no live render or host configuration to inspect."
        sourceIds={['render-proof-limit']}
      />

      <SourceDisclosure sources={typedSources} />
    </DocArticle>
  )
}
