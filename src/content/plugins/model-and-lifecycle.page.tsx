import meta from './model-and-lifecycle.meta'
import sources from './model-and-lifecycle.sources.json'
import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
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

const typedSources = sources as readonly SourceRecord[]

const lifecycleDiagram = defineDiagramDefinition({
  id: 'plugin-generation-lifecycle',
  title: 'A plugin crosses a gate before it becomes a generation',
  caption:
    'Observed source flow: BB selects an install source, checks its manifest and compatibility, then loads or rejects a fresh generation.',
  evidenceMix: ['observed'],
  sourceIds: [
    'install-sources',
    'manifest-gate',
    'server-factory',
    'candidate-generation',
    'reload-rollback',
    'app-build',
  ],
  code: `flowchart TD
  source["Path / builtin / git / npm"] --> gate["Manifest + SDK gate"]
  gate --> factory["Server factory"]
  factory --> candidate["Fresh candidate"]
  candidate -->|success| swap["Atomic generation swap"]
  candidate -->|failure| prior["Keep prior generation"]
  swap --> app["App bundle reconciliation"]
  swap --> dispose["Dispose old generation"]`,
  textAlternative:
    'Observed: BB begins with one of its supported install sources: a local path, a builtin, a Git source, or an npm source. It reads the plugin manifest and checks the declared BB and plugin SDK requirements before loading a server factory. The factory creates a fresh candidate generation. A successful candidate becomes the loaded generation through an atomic map swap. A failed candidate is closed and the prior generation remains in place. After a successful server swap, the optional app bundle is reconciled separately, and the old generation is disposed rather than left running.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Install sources are parsed before a manifest and SDK compatibility gate.',
          'The server loads a fresh generation, then swaps it into the running map atomically.',
          'A plugin is full-trust in process; the host still owns routing, providers, and lifecycle.',
        ]}
      />

      <p>
        A plugin is an extension package that BB loads inside its server process. The
        package may also ship a frontend bundle, but that bundle does not create a second
        app shell. The useful mental model is a gated lifecycle: source, manifest,
        compatibility, server generation, optional app surface, then disposal.
      </p>

      <DiagramCard definition={lifecycleDiagram} />

      <PageSection id="install-gate" title="Install is a gated handoff">
        <p>
          The install source is not itself permission to run. BB parses path, builtin,
          Git, and npm forms, then reads identity, entries, engine ranges, and other
          manifest fields. The SDK gate is part of that handoff. A package that cannot
          satisfy the declared host or SDK contract does not become a running generation.
          The server load has a 30-second bound before the candidate is treated as failed.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Manifest and compatibility checks happen before the server factory is admitted."
          explanation="The source inventory identifies install-source parsing, manifest fields, and a bounded server load as separate runtime steps."
          sourceIds={['install-sources', 'manifest-gate', 'server-factory']}
        />
        <p>
          The server factory is in-process code. That detail changes the trust model:
          this is not a browser-style sandboxed extension. A plugin can use the APIs BB
          exposes, but the process and origin boundary are shared. The host still keeps
          routing, provider and model selection, thread lifecycle, and canonical sidebar
          and composer mechanics.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Full trust describes placement, not ownership of the BB product."
          explanation="Server code and content scripts run in the BB process or same-origin document; the host-mediated API remains the extension boundary."
          sourceIds={['full-trust']}
        />
      </PageSection>

      <PageSection id="generation-swap" title="Reload swaps generations atomically">
        <p>
          BB loads a candidate separately from the currently loaded map. When the
          candidate succeeds, the runtime swaps the loaded generation atomically. When
          it fails, candidate resources are closed and the prior generation stays
          available with a reload-failed state. This gives a reload a clear commit point:
          an incomplete candidate is not presented as the live plugin.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="A failed backend reload preserves the prior running generation."
          explanation="The runtime closes failed candidate resources and leaves the old generation in place."
          sourceIds={['candidate-generation', 'reload-rollback', 'app-build']}
        />
        <p>
          The optional frontend follows its own reconciliation path. BB builds app
          JavaScript, CSS, and metadata, compares compatibility and hashes, and commits
          slot mounts transactionally. A backend-only reload need not remount unchanged
          UI. If the frontend generation changes, its old CSS, content scripts, and slot
          mounts are cleaned up before the new surface is committed.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="The server and frontend can advance on related but independent generation paths."
          explanation="This is an inference from the separate backend generation swap and frontend reconciliation contracts; it does not promise a user-visible render timing."
          basedOn={['candidate-generation', 'frontend-reconcile']}
        />
      </PageSection>

      <PageSection id="independent-disposal" title="Server and app disposal are coordinated">
        <p>
          A service receives an abort signal and may be restarted with a capped backoff
          while its generation is healthy. Reload, disable, and shutdown abort that
          service. Safe disposal then stops services, runs cleanup hooks in last-in-first-
          out order, drains in-flight calls, closes plugin database handles, and
          invalidates stale handles. A service that hangs during stop can block a safe
          reload rather than being silently detached.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Disposal is a lifecycle boundary for services, hooks, calls, storage, and handles."
          sourceIds={['service-stop', 'dispose-hooks', 'frontend-disposal']}
        />
        <p>
          The frontend has a matching failure boundary: incompatible bundles, import or
          setup failures, mount timeouts, late disposers, and per-generation CSS cleanup
          are handled as plugin failures. The host can keep the rest of BB usable while
          the plugin surface is unavailable. That containment is scoped to the documented
          lifecycle; it is not a claim that arbitrary content-script behavior is isolated.
        </p>
      </PageSection>

      <Limits>
        <ul>
          <li>Observed source does not prove an installed plugin, browser render, authenticated session, provider call, or deployment result.</li>
          <li>Full trust is not process, DOM, CSS, or database isolation.</li>
          <li>Nothing here grants a plugin direct provider/model access or arbitrary host-database access.</li>
        </ul>
      </Limits>

      <EvidenceCallout
        kind="unknown"
        claim="The exact end-user timing of server and app reconciliation is Unknown from this source-only snapshot."
        explanation="R02 records contracts and failure paths, but no live plugin install or rendered app inspection was performed."
        sourceIds={['render-proof-limit']}
      />

      <SourceDisclosure sources={typedSources} />
    </DocArticle>
  )
}
