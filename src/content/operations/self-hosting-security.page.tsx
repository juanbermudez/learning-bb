import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
import meta from './self-hosting-security.meta'
import sources from './self-hosting-security.sources.json'
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

const pageSources = sources as unknown as readonly SourceRecord[]

const listenerBoundaries = defineDiagramDefinition({
  id: 'listener-boundaries',
  title: 'The listener decides the first boundary',
  caption: 'Observed listener and browser-origin behavior make loopback the default boundary and wildcard binding an explicit risk.',
  evidenceMix: ['observed'],
  sourceIds: ['loopback-default', 'wildcard-warning', 'origin-guard', 'daemon-rebinding'],
  code: `graph LR
  Browser[Browser control] -->|local request| Server[BB server]
  Server -->|default bind| Loopback[127.0.0.1]
  Server -->|opt-in bind| Wildcard[0.0.0.0]
  Browser -.->|foreign origin| Guard[Origin guard]
  Guard -->|browser boundary| Server`,
  textAlternative: 'Observed reading order: the browser controls the BB server. By default, the server binds to 127.0.0.1, keeping the listener on the local machine. An explicit 0.0.0.0 bind creates a reachable wildcard listener and carries a warning because the public API is not user-authenticated. A foreign browser origin reaches the origin guard, which blocks browser cross-site requests. The dotted edge marks the browser-origin check as a separate boundary from the listener. It does not mean that the guard proves who the user is, and the diagram does not claim that a firewall or private network is configured for the wildcard case.',
})

const selfHostChoices = defineDiagramDefinition({
  id: 'self-host-choices',
  title: 'Configured crossings have different proof limits',
  caption: 'Observed configuration seams support distinct local and hosted arrangements; the update-signature guarantee remains Unknown.',
  evidenceMix: ['observed', 'unknown'],
  sourceIds: ['private-network', 'connect-config', 'update-signature-unknown'],
  code: `graph LR
  Server[BB server] -->|loopback| Local[Local browser]
  Server -->|private route| Private[Private network]
  Server -->|configurable apex| Gate[Connect gate]
  Gate -->|owner session| Remote[Remote browser]
  Update[Update path] -.->|signature ?| Signature[Signature unknown]`,
  textAlternative: 'Observed reading order: the BB server can remain loopback-bound for a local browser. A separate private-network route can provide remote reachability while keeping that listener local; the source names Tailscale Serve as an outside option, not a built-in BB capability. The Connect client also accepts a configurable apex, and an owner session can cross that gate to a remote browser. Unknown reading: the update path is shown with a dotted edge and a question mark because protocol and transport checks do not establish a package-signature guarantee. No edge claims a complete self-hosted production deployment.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Loopback is the default trust boundary for the server listener.',
          'An origin guard blocks browser cross-site requests; it is not identity authentication.',
          'Complete self-hosting and update-signature guarantees remain Unknown.',
        ]}
      />

      <p>
        <EvidenceBadge label="Observed" /> A safe self-hosting explanation starts with the listener, not with a deployment promise. BB’s packaged server binds to <code>127.0.0.1</code> by default. The browser can control the server there, while the server and host daemon keep policy, state, and execution on the machine. The public API does not add a user or session credential check at that local layer. A browser-origin guard is useful against cross-site browser requests, but it is not identity authentication.
      </p>
      <EvidenceCallout
        kind="observed"
        claim="Loopback reachability is the primary local trust boundary; the origin check is a browser boundary, not a user boundary."
        explanation="Requests without an Origin, such as CLI or SDK calls, remain supported, so the guard cannot stand in for identity authentication."
        sourceIds={['loopback-default', 'origin-guard']}
      />
      <DiagramCard definition={listenerBoundaries} />

      <PageSection id="start-with-loopback" title="Start with the loopback boundary">
        <p>
          <EvidenceBadge label="Observed" /> The bind setting accepts <code>127.0.0.1</code> or <code>0.0.0.0</code>. The first keeps the server reachable only through local interfaces. The second is a compatibility escape hatch: the startup warning says that the public API is unauthenticated and can expose command execution and file reads to any network that can reach the port. A wildcard bind is therefore not “remote auth.” It is a wider network boundary that needs a trusted private boundary outside this application.
        </p>
        <p>
          <EvidenceBadge label="Observed" /> The same discipline applies to the host daemon’s local API. It binds to loopback and rejects foreign browser origins, including DNS-rebound public names, while deliberately allowing no-Origin runtime callers. A same-user local process can still use the machine-auth proxy by design. That residual is a local-process trust assumption, not proof of container or agent isolation.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="Inference: an origin check narrows browser attack paths but cannot protect an unauthenticated API from every reachable caller."
          explanation="This follows from the observed rejection of foreign browser origins alongside continued support for callers that omit Origin."
          basedOn={['origin-guard', 'daemon-rebinding']}
        />
      </PageSection>

      <PageSection id="what-self-hosting-means" title="What self-hosting does and does not mean">
        <p>
          <EvidenceBadge label="Observed" /> The Connect plugin accepts an explicit base URL, and the client tests cover a self-hosted gate address. That proves a configurable connection seam. It does not prove that a complete self-hosted product is packaged. The inspected evidence does not establish the required D1 and Durable Object deployment, wildcard DNS, cookie-domain design, secret rotation, or production monitoring checklist for an independently operated gate.
        </p>
        <p>
          <EvidenceBadge label="Observed" /> A private network can be a different boundary. The local guide documents keeping BB loopback-bound behind a private Tailscale Serve URL with Tailscale ACLs and says not to use Funnel or the public internet. Tailscale is not built into BB, and this explanation does not turn that external network into a guaranteed product feature.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="Unknown: the inspected source does not provide a complete production self-hosting runbook or checklist."
          explanation="Configuration seams and a private-network alternative are documented, but deployment, DNS, cookies, secret rotation, and operations remain outside the established evidence."
          sourceIds={['connect-config', 'self-hosting-runbook-unknown', 'private-network']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown: hosted retention and complete provider-credential transport were not established by this source window."
          explanation="The source describes local storage and selected provider-usage paths, not every hosted payload or provider transport."
          sourceIds={['hosted-retention-unknown', 'provider-token-unknown']}
        />
        <DiagramCard definition={selfHostChoices} />
      </PageSection>

      <PageSection id="read-the-threat-table" title="Read the threat table">
        <p>
          <EvidenceBadge label="Observed" /> The accepted table below keeps mitigation and residual risk together. Read each row as a boundary statement: the current source-backed control has a defined scope, and the residual column says what it does not cover. The bracketed source ID is the adjacent citation record. “Unknown” means the inspected evidence stops; it is not permission to assume a stronger guarantee.
        </p>
        <DataTable
          caption="Accepted trust-boundary threat table"
          headers={['Threat or boundary failure', 'Current mitigation', 'Residual or confidence']}
          rows={[
            [<><EvidenceBadge label="Observed" /> Wildcard server bind</>, <>Loopback default; wildcard requires explicit configuration. <code>wildcard-bind</code></>, <><EvidenceBadge label="Observed" /> Firewall policy is outside BB. <code>wildcard-bind</code></>],
            [<><EvidenceBadge label="Observed" /> Browser CSRF</>, <>Foreign origins are rejected, including simple mutation attempts. <code>browser-csrf</code></>, <><EvidenceBadge label="Observed" /> Origin checks are not identity authentication. <code>browser-csrf</code></>],
            [<><EvidenceBadge label="Observed" /> Daemon DNS rebinding</>, <>Loopback binding and Host checks reject foreign browser access. <code>dns-rebinding</code></>, <><EvidenceBadge label="Observed" /> Same-user local processes remain in scope. <code>dns-rebinding</code></>],
            [<><EvidenceBadge label="Observed" /> Credential theft via proxy</>, <>The loopback proxy rejects browser headers and injects credentials upstream. <code>machine-proxy</code></>, <><EvidenceBadge label="Observed" /> It is not an agent or container isolation boundary. <code>machine-proxy</code></>],
            [<><EvidenceBadge label="Observed" /> Stolen Connect credential</>, <>The gate hashes, checks revocation, and closes the tunnel object. <code>server-credential</code></>, <><EvidenceBadge label="Observed" /> Plugin trust and host access remain decisive. <code>server-credential</code></>],
            [<><EvidenceBadge label="Observed" /> Stolen machine credential</>, <>Hash lookup requires a non-revoked machine owned by the label’s user. <code>machine-credential</code></>, <><EvidenceBadge label="Observed" /> Internal host-key trust is still separate. <code>machine-credential</code></>],
            [<><EvidenceBadge label="Observed" /> Machine manages another host</>, <>Machine paths are refused for host-management mutations. <code>machine-management</code></>, <><EvidenceBadge label="Observed" /> Code already on the server host is trusted. <code>machine-management</code></>],
            [<><EvidenceBadge label="Observed" /> Enrollment replay</>, <>Enrollment keys are one-use, short-lived, and metadata-bound. <code>enrollment-replay</code></>, <><EvidenceBadge label="Observed" /> A leaked active host key still needs revocation. <code>enrollment-replay</code></>],
            [<><EvidenceBadge label="Observed" /> Privileged work on capped host</>, <>Owner-only ceilings clamp execution modes before provider validation. <code>permission-ceiling</code></>, <><EvidenceBadge label="Observed" /> Local server code is outside that limit. <code>permission-ceiling</code></>],
            [<><EvidenceBadge label="Observed" /> Malicious plugin</>, <>Plugin install and route checks exist, but plugins run in-process. <code>plugin-trust</code></>, <><EvidenceBadge label="Observed" /> Installation is a trust decision, not a sandbox. <code>plugin-trust</code></>],
            [<><EvidenceBadge label="Observed" /> Wrong or older update</>, <>Transport, protocol ordering, private install location, and backoff are checked. <code>update-signature-unknown</code></>, <><EvidenceBadge label="Unknown" /> No package-signature check is visible here. <code>update-signature-unknown</code></>],
            [<><EvidenceBadge label="Observed" /> Unintended port share</>, <>Only registered decimal targets are forwarded; bare machine labels are rejected. <code>share-target</code></>, <><EvidenceBadge label="Observed" /> The shared service still owns its authentication. <code>share-target</code></>],
          ]}
        />
        <EvidenceCallout
          kind="observed"
          claim="The threat table preserves the accepted mitigation and residual boundary for each listed failure mode."
          explanation="The source records named in the rows are local snapshot evidence; their public fields remain unverified until a later audit."
          sourceIds={['wildcard-bind', 'browser-csrf', 'dns-rebinding', 'machine-proxy', 'server-credential', 'machine-credential', 'machine-management', 'enrollment-replay', 'permission-ceiling', 'plugin-trust', 'update-signature-unknown', 'share-target']}
        />
      </PageSection>

      <PageSection id="what-updates-prove" title="What update checks do not prove">
        <p>
          <EvidenceBadge label="Observed" /> On protocol mismatch, the daemon can fetch a version endpoint, reject an equal or older protocol, and install a newer package into its private data-directory location. Auto-update requires HTTPS or loopback, writes the archive with restrictive permissions, removes the temporary file, and keeps the current daemon while failures back off. These are transport, ordering, placement, and retry controls.
        </p>
        <p>
          <EvidenceBadge label="Unknown" /> The inspected update path does not perform a package signature or checksum verification before installation. A signature mechanism may exist elsewhere, but it is not established here. Do not translate “HTTPS” or “newer protocol” into “the package is authentic.” The same proof boundary applies to any future self-hosting runbook: absence of an observed step stays Unknown.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="Unknown: a complete production update-signature guarantee is not established by the inspected path."
          explanation="The source shows protocol and transport checks, not artifact-signature verification."
          sourceIds={['update-transport', 'update-order', 'update-install', 'update-signature-unknown']}
        />
      </PageSection>

      <Limits>
        <li><EvidenceBadge label="Unknown" /> Complete independent Connect deployment, DNS, cookie, secret-rotation, and monitoring procedures are not established.</li>
        <li><EvidenceBadge label="Unknown" /> No package-signature or checksum guarantee is established for daemon self-update.</li>
        <li><EvidenceBadge label="Unknown" /> Hosted payload retention and provider-specific credential transport were not audited to completion.</li>
        <li><EvidenceBadge label="Observed" /> A public bind is not safe by default; any external network boundary must be evaluated separately.</li>
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
