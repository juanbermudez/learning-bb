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
import meta from './connector-registry.meta'
import sources from './connector-registry.sources.json'

export { meta }

const pageSources = sources as unknown as readonly SourceRecord[]

const connectorDiagram = defineDiagramDefinition({
  id: 'connector-registry-boundaries',
  title: 'Observed plugin primitives, Proposed connector registry',
  caption: 'Plugin auth, secrets, schedules, and account rows are observed; registry policy and external OAuth work are dashed.',
  evidenceMix: ['observed', 'inference', 'proposed', 'unknown'],
  sourceIds: ['plugin-runtime', 'plugin-auth', 'secret-settings', 'better-auth-account', 'freshness-audit'],
  code: `flowchart LR
classDef observed fill:var(--surface),stroke:var(--line-strong),stroke-width:1.5px
classDef inference fill:var(--surface-subtle),stroke:var(--evidence-inference),stroke-width:1.5px,stroke-dasharray:8 3 2 3
classDef proposed fill:var(--surface-subtle),stroke:var(--evidence-proposed),stroke-width:1.5px,stroke-dasharray:9 6
classDef unknown fill:var(--surface-subtle),stroke:var(--evidence-unknown),stroke-width:1.5px,stroke-dasharray:2 5
runtime["Observed: In-process plugin"] --> auth["Observed: HTTP auth modes"]
runtime --> secret["Observed: Secret settings"]
auth --> sync["Observed: Background sync"]
account["Observed: Auth account rows"] --> identity["Observed: Identity boundary"]
registry["Proposed: Connector registry"] -.-> grants["Proposed: Account grants"]
registry -.-> broker["Proposed: OAuth broker"]
registry -.-> token["Proposed: Token manager"]
registry -.-> webhook["Proposed: Webhook sync"]
registry -.-> executor["Proposed: Executor boundary"]
trust["Inference: Grants are policy"] -.-> registry
relay["Unknown: Connect webhook relay"] -.-> webhook
class runtime,auth,secret,sync,account,identity observed
class registry,grants,broker,token,webhook,executor proposed
class trust inference
class relay unknown`,
  textAlternative: 'Read left to right. The in-process plugin runtime connects to observed HTTP auth modes and secret settings. Those connect to a background sync pattern. Better Auth account rows form a separate observed identity boundary; they are not a SaaS connector registry. The registry, account grants, OAuth broker, token manager, webhook sync, and executor boundary are Proposed dashed nodes. Grants are an Inference as policy: because plugins run in process, a grant does not itself isolate a malicious plugin. Whether Connect can safely relay third-party webhooks is Unknown and is shown with a dotted edge. The diagram keeps current plugin primitives separate from the new core policy and external services required for connector accounts.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed: plugin auth modes, secret settings, background work, GitHub cache refresh, in-process loading, and auth rows.',
          'Proposed: connector accounts, grants, OAuth broker, token manager, webhook sync, and executor dispatch.',
          'Inference: grants improve policy but are not process isolation; Unknown: Connect webhook relay and provider-specific behavior.',
        ]}
      />

      <EvidenceCallout
        kind="proposed"
        claim="Proposal only: a core registry would own connector policy while service-specific implementations remain plugins."
        explanation="The existing plugin catalog, secret rows, and Better Auth account rows are useful seams, but none is the proposed SaaS connector system."
        sourceIds={['freshness-audit', 'connector-guide']}
      />

      <PageSection id="observed-current-seams" title="Observed current seams">
        <p>
          <strong>User outcome.</strong> A reader should be able to name the existing
          plugin and auth primitives without calling them an integrations registry.
          Plugin HTTP routes support `local`, `token`, and `none`; the last mode is
          reserved for signature-verified webhook patterns. Plugin realtime is an
          ephemeral broadcast, and background services and schedules provide a place
          for recurring work.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Plugins expose HTTP auth modes, ephemeral realtime, secret settings, and background execution, while the server loads plugin code in process."
          explanation="Secret settings are stored in per-plugin files with restricted permissions, and in-process loading means the runtime is trusted code rather than a sandbox."
          sourceIds={['plugin-auth', 'plugin-realtime', 'secret-settings', 'plugin-settings', 'plugin-runtime']}
        />
        <p>
          The GitHub plugin is a concrete sync pattern: it uses the GitHub CLI for
          authentication, stores no plugin token, and refreshes a local SQLite cache
          on a schedule. Connect’s better-auth schema also contains account rows with
          provider and access or refresh token fields. Therefore the accurate claim is
          “no SaaS connector-account workflow or token manager was found,” not “BB has
          zero OAuth or token rows.”
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Plugin primitives and Better Auth account rows exist, but the inspected source does not show a SaaS connector registry or grant workflow."
          explanation="The plugin catalog, installed-plugin records, and auth accounts must stay conceptually separate from the Proposed registry."
          sourceIds={['github-cache', 'better-auth-account', 'freshness-audit']}
        />
        <nav aria-label="Current page backlinks">
          <p><strong>Current-page backlinks.</strong> Read the present extension and trust boundaries:</p>
          <ul>
            <li><Link to="/plugins/backend-powers">Plugin backend powers</Link></li>
            <li><Link to="/plugins/compatibility-trust-fallbacks">Compatibility, trust, and fallbacks</Link></li>
            <li><Link to="/operations/remote-access-machines">Remote access and machines</Link></li>
          </ul>
        </nav>
      </PageSection>

      <PageSection id="explicit-gap" title="The explicit gap">
        <p>
          A connector registry needs a first-class connector type, account identity,
          credential lifecycle, capability names, grants, audit events, sync cursors,
          webhook ingress, and a token manager. It also needs to decide whether a
          connector call runs in the server process or on an enrolled host. None of
          those contracts follows automatically from plugin settings or a GitHub
          cache.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The evidence does not establish encrypted third-party credential storage, OAuth redirect handling, Connect webhook relay, or provider-specific sync semantics."
          explanation="The existing `none` HTTP mode is a signature-verification pattern, not permission to widen public ingress without a replay and ownership design."
          sourceIds={['plugin-auth', 'better-auth-account', 'freshness-audit']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Because plugin code is loaded in process, grants are policy and audit controls, not a plugin-isolation boundary."
          explanation="This follows from the observed runtime placement and auth primitives; a malicious or compromised plugin could still inspect process-accessible data."
          basedOn={['plugin-runtime', 'plugin-auth']}
        />
        <p>
          The stale guide’s daemon example also needs the corrected protocol value:
          `HOST_DAEMON_PROTOCOL_VERSION` is 119. A future executor payload would
          require a wire-contract review and a real version change; a registry page or
          server-only policy does not justify a bump.
        </p>
      </PageSection>

      <PageSection id="proposed-smallest-path" title="Proposed smallest path">
        <DiagramCard definition={connectorDiagram} />
        <p>
          <strong>Proposed.</strong> Add a core registry service with account,
          credential, grant, audit, and sync-state records. Keep connector plugins
          responsible for service metadata, capabilities, API knowledge, tools, and
          sync functions. Use an external OAuth broker for provider client secrets and
          redirects, and a separately designed webhook ingress that wakes a pull sync;
          a webhook should not become the source of truth. Start execution in the
          server. Add host-daemon executor dispatch only after its payload, token
          lifetime, and revocation behavior are defined against protocol 119.
        </p>
        <p>
          <strong>Legend.</strong> <EvidenceBadge label="Observed" /> is solid
          `1.5px`; <EvidenceBadge label="Inference" /> is dash-dot `8 3 2 3`;
          <EvidenceBadge label="Proposed" /> is dashed `9 6`; and <EvidenceBadge label="Unknown" />
          is dotted `2 5`. Status words are printed on nodes and in this legend.
        </p>
        <DataTable
          caption="Ownership boundaries for the smallest proposed connector path"
          headers={['Area', 'Observed seam', 'Proposed owner', 'Missing contract']}
          rows={[
            ['Connector code', 'In-process plugin runtime', 'Connector plugin', 'SDK registration and capability shape'],
            ['Credentials', 'Secret settings and auth account rows', 'Core registry', 'Encryption, rotation, and masking'],
            ['Access', 'HTTP auth and UI consent primitives', 'Core policy', 'Per-account grants and audit'],
            ['Sync', 'Schedules and GitHub cache pattern', 'Core scheduler + plugin', 'Cursor, webhook, and retry rules'],
            ['Execution', 'Enrolled host daemon', 'Server first; host later', 'Payload, token lifetime, and protocol review'],
          ]}
        />
      </PageSection>

      <PageSection id="risks-unknowns-non-goals" title="Risks, Unknowns, and non-goals">
        <p>
          <strong>Risks.</strong> Refresh tokens could leak if plugins receive them or
          can read an unprotected data directory. A hosted broker could become a
          second account authority. Webhooks could widen public ingress, replay old
          events, or wake the wrong local server. A remote executor could retain a
          short-lived token longer than its job. Grants could look like containment
          while the runtime remains trusted in process.
        </p>
        <p>
          <strong>Unknowns.</strong> Decide which Connect account rows are allowed to
          hold third-party tokens, whether Connect can safely relay provider webhooks,
          what the future user model means, which provider scopes are stable, and how
          rate limits and revocation behave across server and host execution.
        </p>
        <p>
          <strong>Non-goals.</strong> This proposal does not treat plugins as
          process-separated, claim zero OAuth code, treat the plugin catalog as a connector registry,
          promise cross-person tenancy, or make grants a security boundary. It does
          not send refresh tokens to a host or change protocol 119 without a wire
          payload.
        </p>
        <Limits>
          <ul>
            <li>It does not prove a connector account, OAuth broker, token manager, webhook ingress, or executor exists.</li>
            <li>It does not prove current plugin secret files are encrypted at rest or safe from trusted in-process code.</li>
            <li>Future proof would require credential redaction tests, grant/audit traces, webhook replay tests, and revocation readbacks.</li>
          </ul>
        </Limits>
        <EvidenceCallout
          kind="proposed"
          claim="Future acceptance would require a core-owned credential choke point and an honest trust boundary around connector plugins."
          explanation="Those are design and verification conditions, not evidence that the registry exists."
          sourceIds={['freshness-audit', 'connector-guide']}
        />
      </PageSection>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
