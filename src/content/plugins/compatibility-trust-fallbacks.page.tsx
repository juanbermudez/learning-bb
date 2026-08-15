import meta from './compatibility-trust-fallbacks.meta'
import sources from './compatibility-trust-fallbacks.sources.json'
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

const compatibilityDiagram = defineDiagramDefinition({
  id: 'plugin-compatibility-fallbacks',
  title: 'Compatibility failure stops a surface or keeps the prior generation',
  caption:
    'Observed: artifact and SDK gates reject incompatible surfaces; backend reload failure can retain the prior generation while frontend failures stay contained.',
  evidenceMix: ['observed'],
  sourceIds: [
    'running-sdk',
    'sdk-range',
    'server-artifact-gate',
    'app-artifact-gate',
    'prior-generation',
    'frontend-failure',
  ],
  code: `flowchart TD
  package["Plugin package"] --> artifact["Server / app artifacts"]
  artifact --> gate["SDK compatibility gate"]
  gate -->|compatible| mount["Load or mount"]
  gate -->|incompatible| skip["Skip surface"]
  reload["Backend reload failure"] --> prior["Keep prior generation"]
  mount --> cleanup["Generation cleanup"]`,
  textAlternative:
    'Observed: BB starts with a plugin package and its server or app artifacts. Compatibility checks examine the running SDK, the declared range, and artifact metadata. A compatible surface can load or mount. An incompatible app bundle is skipped instead of being treated as a usable surface. A backend reload failure has a different fallback: the failed candidate is closed and the prior generation remains running. A surface that did mount still reaches generation cleanup on reload or disposal. These paths contain failure; they do not make plugin code sandboxed.',
})

function status(text: string, sourceId: string) {
  return (
    <>
      <EvidenceBadge label="observed" /> {text} · <code>{sourceId}</code>
    </>
  )
}

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The observed running SDK is 0.4.4; same-major floors differ from exact prebuilt-artifact checks.',
          'Full trust includes same-origin CSS and content-script reach; it is not isolation.',
          'Reload, slot, list, and interaction failures have different documented fallbacks.',
        ]}
      />

      <p>
        “Compatible” answers whether a particular artifact can enter a particular host.
        “Trusted” answers how far that code can reach once admitted. “Fallback” answers
        what BB does when loading or mounting fails. They are three different questions.
        Conflating them produces the wrong promise: a compatible plugin is not sandboxed,
        and a contained UI crash does not prove that every plugin action is harmless.
      </p>

      <DiagramCard definition={compatibilityDiagram} />

      <PageSection id="compatibility-gates" title="Compatibility has more than one gate">
        <p>
          The observed running plugin SDK is <code>0.4.4</code>, with major version zero.
          A declared range can be accepted directly. When it is a same-major floor, a
          higher running version can satisfy that floor; a different major is rejected.
          That is range compatibility, not a guarantee that every private implementation
          detail is unchanged. Prebuilt server artifacts use a stricter exact SDK check,
          while an app bundle becomes incompatible when its SDK major does not match.
        </p>
        <DataTable
          caption="Compatibility gates that should not be collapsed into one version check."
          headers={['Gate', 'Observed rule', 'Failure meaning', 'Evidence']}
          rows={[
            ['Running SDK', <>The inspected running version is <code>0.4.4</code> and the SDK major is <code>0</code>.</>, 'Snapshot fact; it does not promise a future installed version.', status('Observed', 'running-sdk')],
            ['Declared range', 'A same-major floor can accept a higher running version; a different major is rejected.', 'The plugin is incompatible with that host contract.', status('Observed', 'sdk-range')],
            ['Prebuilt server artifact', 'The artifact gate requires exact SDK compatibility.', 'The server artifact is not admitted as a compatible prebuilt.', status('Observed', 'server-artifact-gate')],
            ['App artifact', 'App metadata is checked separately; SDK major mismatch makes the bundle incompatible.', 'The frontend surface is skipped or contained without changing the host.', status('Observed', 'app-artifact-gate')],
            ['Build output', 'The app build emits `app.js`, `app.css`, and `app.meta.json`; other dependencies are bundled or shimmed by the build.', 'Distribution shape is part of compatibility review.', status('Observed', 'app-build')],
          ]}
        />
        <EvidenceCallout
          kind="observed"
          claim="SDK range compatibility and artifact compatibility are related gates with different strictness."
          explanation="The same-major floor nuance must not be rewritten as blanket forward compatibility, especially for prebuilt server artifacts."
          sourceIds={['install-sources', 'running-sdk', 'sdk-range', 'server-artifact-gate', 'app-artifact-gate']}
        />
        <p>
          Distribution source and artifact form are separate decisions. A plugin may be
          installed from a path, Git, npm, or a bundled/official source, then arrive as
          source or a prebuilt artifact. The app build records identity and SDK metadata
          beside its JavaScript and CSS, and selected dependency families are supplied by
          host shims while other dependencies are bundled. A successful download or
          build therefore does not bypass the compatibility gate.
        </p>
      </PageSection>

      <PageSection id="trust-and-reach" title="Trust reaches further than the mount">
        <p>
          A loaded plugin is full-trust server code in the BB process and full-trust
          content-script code in the same-origin document. The build scopes authored
          utility CSS under plugin data attributes, but imported CSS is intentionally
          unscoped and can target editor decorations outside the mount. The foreign-DOM
          guard protects React-owned nodes from accidental mutation; it is not a security
          boundary. A content script therefore sees a trusted page context, not an
          isolated extension document.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="CSS scoping reduces accidental collisions but does not turn plugin code into a sandbox."
          explanation="Imported CSS can remain global, and content scripts run same-origin with authenticated page state."
          sourceIds={['css-scope', 'content-script-trust', 'content-script-lifecycle']}
        />
        <p>
          The host boundary still matters. BB owns the provider and model selection,
          thread lifecycle, route grammar, and host database. Plugins contribute through
          the SDK and host-rendered slots. No direct provider call, host-database query,
          or isolation claim follows from having a frontend bundle or content script.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="A plugin can have broad reach and still have narrow product authority."
          explanation="This inference combines full-trust execution with the host-owned execution and routing controls; broad reach is not equivalent to ownership."
          basedOn={['content-script-trust', 'host-authority']}
        />
      </PageSection>

      <PageSection id="failure-containment" title="Failures preserve a usable host">
        <p>
          Failure paths are specific. A backend reload failure closes the candidate and
          retains the prior generation. Frontend loading contains incompatible bundles,
          failed imports, setup errors, mount timeouts, late disposers, and CSS cleanup by
          generation. A throwing React slot is marked crashed instead of taking down the
          host. The experimental thread list falls back to the builtin list, a header
          accessory hides, and a pending interaction cancels rather than wedging the
          composer. Disposal also clears generation-owned row status and stale handles.
        </p>
        <DataTable
          caption="Failure and recovery paths are scoped to the surface that failed."
          headers={['Failure', 'Observed fallback', 'What it does not prove', 'Evidence']}
          rows={[
            ['Backend reload failure', 'Close candidate; retain prior running generation.', 'Not a guarantee that arbitrary service code cannot hang safe reload.', status('Observed', 'prior-generation')],
            ['Frontend bundle/import/setup failure', 'Contain the plugin surface; keep the rest of BB available.', 'Not frontend isolation from same-origin reach.', status('Observed', 'frontend-failure')],
            ['Slot throws', 'Per-plugin boundary marks the slot crashed.', 'Not a guarantee for unbounded content-script side effects.', status('Observed', 'slot-boundary')],
            ['Replacement thread list fails', 'Use the builtin list and show host recovery feedback.', 'The replacement list is not a stable exclusive host contract.', status('Observed', 'list-fallback')],
            ['Pending interaction fails', 'Cancel the interaction rather than wedge the composer.', 'No claim that a failed request can be resumed automatically.', status('Observed', 'pending-fallback')],
            ['Generation changes', 'Dispose old CSS/scripts/mounts and invalidate stale handles.', 'No claim that external side effects are undone by disposal.', status('Observed', 'frontend-cleanup')],
          ]}
        />
        <p>
          These fallbacks preserve the host surface that can still make a useful
          decision. They do not promise that plugin-owned external effects are undone,
          that a service with a hung stop callback can be detached safely, or that a
          content script cannot touch same-origin state. The recovery unit is the loaded
          generation, slot, list, or interaction named by the failure path. Keeping that
          unit explicit prevents “contained” from becoming a claim of total isolation.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="`bb.ui.registerThreadAction` is not an available backend capability in this snapshot."
          explanation="A frontend comment names it as a sibling, but R02 found no matching backend registration, plugin API, or runtime. Treat the name as an observed documentation contradiction with Unknown semantics, not as a callable surface."
          sourceIds={['thread-action-contradiction']}
        />
      </PageSection>

      <Limits>
        <ul>
          <li>All public source fields remain unverified; no invented immutable GitHub or raw URL is supplied.</li>
          <li>Source inspection does not prove installation, browser rendering, authenticated live behavior, provider execution, or deployment.</li>
          <li>Fallbacks contain documented host surfaces; they do not provide a general plugin security sandbox or undo arbitrary side effects.</li>
        </ul>
      </Limits>

      <EvidenceCallout
        kind="unknown"
        claim="The exact semantics of the commented `registerThreadAction` name remain Unknown until a matching public contract exists."
        explanation="The current evidence resolves the contradiction by preserving the comment as a source observation and withholding capability status."
        sourceIds={['thread-action-contradiction', 'render-proof-limit']}
      />

      <SourceDisclosure sources={typedSources} />
    </DocArticle>
  )
}
