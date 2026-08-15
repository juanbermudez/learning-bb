import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
import meta from './remote-access-machines.meta'
import sources from './remote-access-machines.sources.json'
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

const localAndRemotePaths = defineDiagramDefinition({
  id: 'local-and-remote-paths',
  title: 'Control and execution stay separate',
  caption: 'Observed boundaries show the browser controlling work while the server and daemon keep ownership of policy and execution.',
  evidenceMix: ['observed'],
  sourceIds: ['local-roles', 'server-loopback', 'connect-browser-route', 'connect-tunnel'],
  code: `graph LR
  Browser[Owner browser] -->|session gate| Worker[Connect Worker]
  Worker -->|framed traffic| Tunnel[Tunnel DO]
  Tunnel -->|outbound tunnel| Plugin[Connect plugin]
  Plugin -->|loopback request| Server[BB server]
  Server -->|host protocol| Daemon[Host daemon]
  Daemon -->|local execution| Provider[Provider runtime]`,
  textAlternative: 'Observed reading order: the owner browser starts at the left and reaches a Connect Worker through an account session. The Worker sends framed traffic to a tunnel object. The Connect plugin receives that outbound tunnel and forwards a loopback request to the BB server. The server remains the policy and state owner. It speaks the host protocol to the host daemon, which performs local filesystem and provider-runtime work. The arrows describe control and transport boundaries, not a claim that the browser executes provider work or that the hosted service becomes the local server.',
})

const credentialHops = defineDiagramDefinition({
  id: 'credential-hops',
  title: 'Three credentials authorize different hops',
  caption: 'An owner session, machine credential, and host key meet different gates in the observed remote path.',
  evidenceMix: ['observed'],
  sourceIds: ['owner-session', 'machine-credential', 'host-key-session', 'port-share-forwarding'],
  code: `sequenceDiagram
  participant Owner as Owner session
  participant Gate as Connect gate
  participant Machine as Machine credential
  participant Server as BB server
  participant Daemon as Host daemon
  Owner->>Gate: browser access
  Machine->>Gate: machine access
  Gate->>Server: forwarded frames
  Daemon->>Server: host key
  Server-->>Daemon: session protocol`,
  textAlternative: 'Observed reading order: an owner session enters the Connect gate for browser access. A machine credential enters the same hosted gate on a remote daemon request and establishes account membership for that machine path. The gate forwards framed traffic toward the BB server. Separately, the daemon presents its host key to the server, where the internal daemon protocol authorizes the execution session. These are separate proofs. A port share still uses the owner session gate and targets a registered local port; it does not replace the shared application’s own authentication.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The browser controls; the server owns policy and state.',
          'The host daemon runs filesystem and provider work on a selected machine.',
          'Connect adds gates around local listeners; it does not erase local boundaries.',
        ]}
      />

      <p>
        <EvidenceBadge label="Observed" /> Start with location, not the word remote. In the local path, the browser is a control surface. The BB server owns policy, database state, and public API handling. A host daemon is the process that runs filesystem and provider work on an enrolled execution machine. A provider is the external runtime or command-line tool that the daemon invokes. The browser does not execute the task itself.
      </p>
      <EvidenceCallout
        kind="observed"
        claim="BB keeps browser control, server policy, and host execution as separate roles."
        explanation="The local server and daemon can be colocated, but their responsibilities are still different."
        sourceIds={['local-roles', 'server-loopback']}
      />
      <DiagramCard definition={localAndRemotePaths} />

      <PageSection id="where-work-runs" title="Where work runs">
        <p>
          <EvidenceBadge label="Observed" /> The local path has three owners. The browser sends control requests. The server applies policy and stores state. The daemon receives an execution plan and starts provider work near the selected filesystem. Treating those as separate owners prevents a common mistake: a UI state such as “running” does not prove that the provider process lives in the browser or in the server.
        </p>
        <p>
          <EvidenceBadge label="Observed" /> A managed remote browser follows a different network path around the same local server. The Connect Worker validates the owner’s account session, a per-label tunnel object frames the request, and the Connect plugin forwards it to the server’s loopback address. The browser is remote; the listener and execution state remain on the selected host.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Connect is an outbound route to a local server or registered port, not a second execution server."
          explanation="The source describes the browser as control and keeps server, daemon, filesystem, and provider execution on the selected host."
          sourceIds={['connect-browser-route', 'connect-tunnel', 'host-local-data', 'port-share-registration']}
        />
      </PageSection>

      <PageSection id="which-gate-crosses" title="Which gate each credential crosses">
        <p>
          <EvidenceBadge label="Observed" /> These credentials are not interchangeable. An owner session proves that the visitor may use the account-owned Connect label. A machine credential proves that a remote daemon belongs to the account’s enrolled machine set. A host key proves the daemon identity to the BB server’s internal protocol. A port share is not a fourth credential: it is an owner-gated route to a registered local port.
        </p>
        <DataTable
          caption="Credential and route boundaries"
          headers={['Proof or route', 'Authorizes', 'Does not prove']}
          rows={[
            [<><EvidenceBadge label="Observed" /> Owner session</>, 'Browser access through an account-owned label.', 'Host enrollment or provider execution identity.'],
            [<><EvidenceBadge label="Observed" /> Machine credential</>, 'Machine-path access at the hosted account gate.', 'The daemon’s internal host identity by itself.'],
            [<><EvidenceBadge label="Observed" /> Host key</>, 'Daemon authentication to the BB server protocol.', 'Account ownership at the hosted gate.'],
            [<><EvidenceBadge label="Observed" /> Port share</>, 'Owner-gated access to one registered decimal port.', 'Authentication built into the shared application.'],
          ]}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference: a successful Connect hop does not collapse the account, machine, and daemon trust decisions into one identity."
          explanation="The conclusion follows from the separate owner-session, machine-credential, and host-key checks described by the source."
          basedOn={['owner-session', 'machine-credential', 'machine-gate', 'host-key-session']}
        />
        <DiagramCard definition={credentialHops} />
      </PageSection>

      <PageSection id="what-connect-carries" title="What Connect carries">
        <p>
          <EvidenceBadge label="Observed" /> The hosted service sees the request material needed to route it: browser HTTP, realtime and terminal WebSocket traffic, share targets, headers, paths, and framed bodies. The tunnel client removes public hop-by-hop details and rewrites the public origin for the loopback request. That rewrite makes the local origin guard compatible with the tunnel; it is not a new user-authentication layer.
        </p>
        <p>
          <EvidenceBadge label="Observed" /> The selected host still holds its server or daemon process, SQLite state, logs, plugin key-value data, filesystem, and provider credentials unless that host software sends something to a provider. Explicit shares are narrow: the plugin registers a decimal port, the Worker replaces the target, and unknown or bare machine targets are rejected. Sharing a port therefore does not establish that the service listening there has authentication.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="Unknown: the inspected source does not establish hosted payload, log, or tunnel-metadata retention."
          explanation="It shows framing and HTTPS/WSS transport, but it does not state a retention period or a separate application-level end-to-end encryption layer."
          sourceIds={['hosted-frames', 'loopback-rewrite', 'hosted-retention-unknown']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown: the inspected paths do not establish every provider credential transport or retention behavior."
          explanation="Provider-specific command transports and token handling remain outside this page’s source window."
          sourceIds={['provider-token-unknown']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown: local same-user process access is not an OS, container, or agent-isolation guarantee."
          explanation="The machine-auth proxy intentionally accepts a same-user local process."
          sourceIds={['local-process-unknown']}
        />
      </PageSection>

      <PageSection id="how-machines-enroll" title="How machines enroll and leave">
        <p>
          <EvidenceBadge label="Observed" /> Enrollment begins with a one-use key that expires after fifteen minutes. The daemon exchanges it for a long-lived host key, binds host identity metadata, and stores that key in a local protected auth file. Later internal routes require the host key, and a protocol session also checks the expected daemon subprotocol and host metadata. This is execution-machine enrollment, not a browser session selecting an existing remote desktop.
        </p>
        <p>
          <EvidenceBadge label="Observed" /> Removal is a chain of revocations: the server disables host and enrollment keys, closes the daemon session, marks the host destroyed, and attempts to revoke its Connect machine credential. Host management is separately restricted: a machine path cannot patch permissions or manage another host. An owner-controlled permission ceiling then clamps requested execution modes before provider validation.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Enrollment, revocation, host management, and execution permission are separate gates."
          explanation="The separation limits what a paired machine can administer, but local code already running on the server host remains outside that machine-path restriction."
          sourceIds={['daemon-enrollment', 'daemon-exchange', 'host-key-persistence', 'host-revocation', 'host-management-gate', 'permission-ceiling']}
        />
      </PageSection>

      <Limits>
        <li><EvidenceBadge label="Unknown" /> Hosted Connect retention and provider-specific token transport were not established by the inspected source.</li>
        <li><EvidenceBadge label="Unknown" /> A same-user local process can use the machine-auth proxy; the source does not claim OS, container, or agent isolation.</li>
        <li><EvidenceBadge label="Unknown" /> A configurable Connect apex is not evidence of a complete independently operated production deployment.</li>
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
