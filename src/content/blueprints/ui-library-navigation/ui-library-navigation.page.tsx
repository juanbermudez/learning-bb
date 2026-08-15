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
import meta from './ui-library-navigation.meta'
import sources from './ui-library-navigation.sources.json'

export { meta }

const pageSources = sources as unknown as readonly SourceRecord[]

const uiDiagram = defineDiagramDefinition({
  id: 'ui-library-navigation-boundaries',
  title: 'Observed shell seams, Proposed visual and navigation layer',
  caption: 'Core-owned routes, shared UI, and plugin slots are solid; beUI treatment and new navigation behavior are dashed.',
  evidenceMix: ['observed', 'proposed', 'unknown'],
  sourceIds: ['route-ownership', 'shared-ui-export', 'slots-stable', 'freshness-audit'],
  code: `flowchart LR
classDef observed fill:var(--surface),stroke:var(--line-strong),stroke-width:1.5px
classDef proposed fill:var(--surface-subtle),stroke:var(--evidence-proposed),stroke-width:1.5px,stroke-dasharray:9 6
classDef unknown fill:var(--surface-subtle),stroke:var(--evidence-unknown),stroke-width:1.5px,stroke-dasharray:2 5
routes["Observed: Core routes"] --> seam["Observed: Shared UI seam"]
seam --> slots["Observed: 13 plugin slots"]
motion["Observed: Two hover transitions"] --> seam
beui["Proposed: beUI adapter"] -.-> seam
fade["Proposed: Route fade"] -.-> routes
composer["Proposed: Bottom composer"] -.-> routes
shortcuts["Proposed: Curated Shortcuts"] -.-> slots
question["Unknown: Motion contract"] -.-> beui
class routes,seam,slots,motion observed
class beui,fade,composer,shortcuts proposed
class question unknown`,
  textAlternative: 'Read left to right. Core-owned routes connect to the shared UI source seam, which connects to the observed plugin-slot registry. The current motion module contributes two hover transitions. Those solid nodes and arrows are Observed. A future beUI adapter would touch the shared seam, while route fade, a bottom composer, and user-curated Shortcuts would extend core-owned surfaces; those nodes and arrows are Proposed and dashed. The motion contract is Unknown because no observed beUI easing scale or Motion dependency is present. The diagram does not suggest that plugin slots own top-level routes. It shows a small adapter path that preserves route ownership while leaving visual and navigation changes explicit.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed: shared UI exports, core-owned routes, two hover transitions, both icon families, and thirteen plugin slots.',
          'Proposed: beUI treatment, route fades, a bottom composer, palette mapping, and user-curated Shortcuts.',
          'Unknown: the future motion contract and whether external visual treatment preserves overlay and slot semantics.',
        ]}
      />

      <EvidenceCallout
        kind="proposed"
        claim="Proposal only: treat beUI as an adapter and visual direction, not as an already-vendored BB library."
        explanation="The smallest path preserves core route ownership, shared source parity, and plugin-slot limits while making each new visual behavior testable."
        sourceIds={['freshness-audit', 'ui-guide']}
      />

      <PageSection id="observed-current-seams" title="Observed current seams">
        <p>
          <strong>User outcome.</strong> A reader should distinguish a visual library
          proposal from the application’s existing ownership rules. Routes remain a
          declarative core concern. Plugins reach panel and navigation surfaces through
          host seams; they do not register arbitrary top-level routes.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The app has a shared UI export seam, core-owned route definitions, and a slot registry with thirteen plugin slot kinds."
          explanation="Those seams are the safe starting points for an adapter. They do not authorize a wholesale component replacement or plugin-owned navigation."
          sourceIds={['shared-ui-export', 'route-ownership', 'slots-stable', 'slots-all']}
        />
        <p>
          The current motion module exposes only control-hover and list-hover
          transitions. The app package includes both Hugeicons and Lucide, so the
          accurate description is a shared Icon seam with two installed families, not
          an observed replacement standard. The root compose view also keeps its
          empty/loading state centered.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The current nine-key thread shortcut limit is a different feature from a persistent, user-curated Shortcuts section."
          explanation="The distinction matters: existing modifier jumps should not be relabeled as a new sidebar information architecture."
          sourceIds={['motion', 'app-icons', 'root-compose', 'shortcut-cap']}
        />
        <nav aria-label="Current page backlinks">
          <p><strong>Current-page backlinks.</strong> Read the present UI boundaries:</p>
          <ul>
            <li><Link to="/interface/shell-and-navigation">App shell and navigation</Link></li>
            <li><Link to="/plugins/ui-surface-atlas">UI extension surface atlas</Link></li>
            <li><Link to="/interface/start-a-thread">Home, composer, and execution controls</Link></li>
          </ul>
        </nav>
      </PageSection>

      <PageSection id="explicit-gap" title="The explicit gap">
        <p>
          The proposed change is a coherent visual and navigation layer, not a claim
          that beUI already exists in BB. Missing pieces include a vendoring or
          adapter policy, a shared easing and duration contract, route-transition
          ownership, a bottom-anchored composer geometry, palette mapping, and a
          persistence model for curated Shortcuts. Each could affect the shell’s
          focus, mobile keyboard, plugin slots, and deep-link behavior.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="No observed beUI easing scale, Motion dependency, or established route-fade contract establishes the proposed visual behavior."
          explanation="The responsive overlay already manages inertness on its dialog panel. The safety rule is to avoid aria-hiding or inerting the app root, not to avoid inert everywhere."
          sourceIds={['motion', 'overlay', 'freshness-audit']}
        />
        <p>
          Keep the adapter incremental. A component can land with a story, focus
          test, reduced-motion state, and rollback path. Route ownership remains core
          even if a future sidebar offers links from plugins. Visual kinship is not a
          reason to copy source, exact composition, or external assets.
        </p>
      </PageSection>

      <PageSection id="proposed-smallest-path" title="Proposed smallest path">
        <DiagramCard definition={uiDiagram} />
        <p>
          <strong>Proposed.</strong> Begin with a small shared adapter layer for
          controls, overlays, and navigation treatment. Add explicit motion tokens
          only after they have reduced-motion and route-interruption tests. Prototype
          route fade-and-build inside the routed content region, then test a
          bottom-anchored composer without moving sidebar chrome. Finally, add
          user-curated Shortcuts as a core-owned typed target union, keeping plugin
          panels behind existing slot and route helpers.
        </p>
        <p>
          <strong>Legend.</strong> <EvidenceBadge label="Observed" /> is solid
          `1.5px`; <EvidenceBadge label="Proposed" /> is dashed `9 6`; and
          <EvidenceBadge label="Unknown" /> is dotted `2 5`. Node text repeats each
          label, so the diagram remains legible without color.
        </p>
        <DataTable
          caption="Ownership boundaries for the smallest proposed UI path"
          headers={['Area', 'Observed seam', 'Proposed owner', 'Missing contract']}
          rows={[
            ['Routes', 'Declarative core route tree', 'App shell', 'Transition scope and interruption'],
            ['Primitives', 'Shared UI export and Vite seam', 'Shared UI adapter', 'Vendoring and parity policy'],
            ['Motion', 'Two hover transitions', 'Shared token owner', 'Easing scale and reduced motion'],
            ['Composer', 'Core route and composer view', 'Core shell', 'Bottom geometry and keyboard'],
            ['Shortcuts', 'Nine thread jump slots', 'Core navigation', 'Typed targets and persistence'],
          ]}
        />
      </PageSection>

      <PageSection id="risks-unknowns-non-goals" title="Risks, Unknowns, and non-goals">
        <p>
          <strong>Risks.</strong> A big-bang replacement could regress focus, deep
          links, responsive overlays, or plugin customizations. A new bottom composer
          could fight mobile viewport changes. A curated navigation section could
          accidentally make plugin routes look core-owned or promise cross-device
          persistence before a data contract exists.
        </p>
        <p>
          <strong>Unknowns.</strong> Decide which package owns motion tokens, whether
          beUI treatment can preserve byte-identical shared source behavior, how
          palette values map to semantic evidence colors, and what Shortcuts may
          target. None is answered by the two present hover transitions.
        </p>
        <p>
          <strong>Non-goals.</strong> This proposal does not replace Hugeicons with
          Lucide, declare a beUI dependency, move route ownership into plugins,
          rename current nine-key jumps, or claim a finished mobile composer.
        </p>
        <Limits>
          <ul>
            <li>It does not prove a beUI package is installed or that its overlay semantics match BB.</li>
            <li>It does not prove route transitions, a bottom composer, or curated Shortcuts exist.</li>
            <li>Future proof would require rendered desktop/mobile states, focus and deep-link tests, and reduced-motion captures.</li>
          </ul>
        </Limits>
        <EvidenceCallout
          kind="proposed"
          claim="Future acceptance would require each visual change to preserve route ownership, plugin slots, focus behavior, and evidence identity."
          explanation="That is a testable integration boundary, not a statement about the inspected BB UI."
          sourceIds={['freshness-audit', 'ui-guide']}
        />
      </PageSection>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
