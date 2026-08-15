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
import meta from './react-native-companion.meta'
import sources from './react-native-companion.sources.json'

export { meta }

const pageSources = sources as unknown as readonly SourceRecord[]

const mobileDiagram = defineDiagramDefinition({
  id: 'react-native-companion-boundaries',
  title: 'Observed remote foundation, Proposed native contracts',
  caption: 'The named API, WebSocket, Connect, and machine seams are solid; a native client and its contracts are dashed.',
  evidenceMix: ['observed', 'proposed', 'unknown'],
  sourceIds: ['server-routes', 'connect-cookie', 'ws-subscribe', 'mobile-gap'],
  code: `flowchart LR
classDef observed fill:var(--surface),stroke:var(--line-strong),stroke-width:1.5px
classDef proposed fill:var(--surface-subtle),stroke:var(--evidence-proposed),stroke-width:1.5px,stroke-dasharray:9 6
classDef unknown fill:var(--surface-subtle),stroke:var(--evidence-unknown),stroke-width:1.5px,stroke-dasharray:2 5
api["Observed: /api/v1"] --> connect["Observed: Connect cookie gate"]
server["Observed: /ws"] --> changes["Observed: Change subscriptions"]
machine["Observed: Machine enrollment"] --> connect
mobile["Proposed: React Native app"] -.-> auth["Proposed: Header auth"]
mobile -.-> outbox["Proposed: Offline outbox"]
mobile -.-> deep["Proposed: Deep links"]
push["Proposed: OS push relay"] -.-> mobile
runtime["Unknown: SDK/runtime fit"] -.-> mobile
class api,connect,server,changes,machine observed
class mobile,auth,outbox,deep,push proposed
class runtime unknown`,
  textAlternative: 'Read left to right. The server exposes named API and WebSocket surfaces, while Connect provides a cookie-gated visitor path and machine enrollment; those are Observed foundations. Change subscriptions provide a realtime protocol shape, but not a native session contract. The React Native app, header authentication, offline outbox, deep links, and OS push relay are Proposed dashed nodes. Runtime and SDK fit is Unknown because an injectable browser transport does not establish React Native or Hermes behavior. The diagram does not claim every endpoint is suitable for a phone. It marks the minimum boundary that a native client would have to prove before adding background work or team access.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed: named API, internal, WebSocket, Connect cookie, machine, change-subscription, and attention seams.',
          'Proposed: a native app, header auth, offline outbox, deep links, and an OS push relay.',
          'Unknown: React Native/Hermes portability, endpoint suitability, attachment behavior, and mobile session lifetime.',
        ]}
      />

      <EvidenceCallout
        kind="proposed"
        claim="Proposal only: a React Native companion would consume a deliberately chosen subset of remote seams."
        explanation="The browser and Electron paths establish useful boundaries, but neither is a native authentication, offline, deep-link, or push contract."
        sourceIds={['mobile-gap', 'native-guide']}
      />

      <PageSection id="observed-current-seams" title="Observed current seams">
        <p>
          <strong>User outcome.</strong> A reader should know which remote foundations
          can be tested first and which mobile behaviors need new work. The server
          mounts named `/api/v1`, `/internal`, and `/ws` surfaces. The public contract
          gives those routes typed definitions rather than requiring a native client to
          guess URL shapes.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The server and public contract expose API and WebSocket boundaries, and Connect validates visitor access through session or desktop cookies."
          explanation="Connect also strips forged gate headers and stamps its own. That is a current routing boundary, not a mobile bearer-header API."
          sourceIds={['server-routes', 'public-contract', 'connect-headers', 'connect-cookie']}
        />
        <p>
          Machine enrollment and listing provide a remote execution foundation. The
          desktop client keeps Connect credentials through Electron safeStorage and
          an encrypted cache, while desktop sessions have a one-hour lifetime. Those
          details are useful constraints, but they cannot be copied into React Native
          without choosing a native secure-storage and renewal contract.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The existing realtime protocol supports subscribe and unsubscribe messages, while attention is also exposed as a pull route."
          explanation="In-app notifications therefore exist as an application behavior even though an OS push relay was not found."
          sourceIds={['ws-subscribe', 'change-kinds', 'attention', 'desktop-session']}
        />
        <nav aria-label="Current page backlinks">
          <p><strong>Current-page backlinks.</strong> Read the existing remote boundaries:</p>
          <ul>
            <li><Link to="/operations/remote-access-machines">Remote access and machines</Link></li>
            <li><Link to="/operations/self-hosting-security">Self-hosting and security boundaries</Link></li>
            <li><Link to="/runtime/events-and-persistence">How events become the timeline</Link></li>
          </ul>
        </nav>
      </PageSection>

      <PageSection id="explicit-gap" title="The explicit gap">
        <p>
          A native companion needs an authentication handshake that does not depend on
          browser cookies, a device and machine-selection model, reconnect and
          subscription behavior, safe local storage, and a policy for what may remain
          offline. It also needs deep-link targets for threads and panes, native
          attachment and voice behavior, and a push-token relay with a content-minimal
          notification payload.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The current SDK browser transport does not establish React Native or Hermes portability, cookie behavior, binary attachments, offline replay, or endpoint suitability."
          explanation="The evidence boundary is runtime-specific. A browser-compatible transport is not a native-client validation."
          sourceIds={['sdk-browser', 'mobile-gap']}
        />
        <p>
          Scope “no push” carefully. The audit found no APNs or FCM relay, but that
          does not deny current in-app or WebSocket attention behavior. Treat native
          push as a future relay with explicit revocation and minimal content, not as
          a silent extension of the existing cookie gate.
        </p>
      </PageSection>

      <PageSection id="proposed-smallest-path" title="Proposed smallest path">
        <DiagramCard definition={mobileDiagram} />
        <p>
          <strong>Proposed.</strong> Start with an owner-only native shell that proves
          session establishment, thread listing, timeline reads, one send path, and
          WebSocket subscribe/reconnect behavior. Define a mobile header-session
          contract beside the existing cookie gate. Store only encrypted refresh or
          pairing material in the native secure store, and keep machine selection
          explicit. Add a bounded offline outbox only after replay, duplicate send,
          attachment, and conflict behavior are tested. Add deep links and OS push as
          separate slices.
        </p>
        <p>
          <strong>Legend.</strong> <EvidenceBadge label="Observed" /> is solid
          `1.5px`; <EvidenceBadge label="Proposed" /> is dashed `9 6`; and
          <EvidenceBadge label="Unknown" /> is dotted `2 5`. The words `Observed`,
          `Proposed`, and `Unknown` are part of every diagram label.
        </p>
        <DataTable
          caption="Ownership boundaries for the smallest proposed native path"
          headers={['Area', 'Observed seam', 'Proposed owner', 'Missing contract']}
          rows={[
            ['Session', 'Connect cookie gate and desktop session', 'Connect + native client', 'Header auth and renewal'],
            ['Threads', 'Typed API and timeline routes', 'Native data layer', 'Endpoint subset and errors'],
            ['Realtime', 'WS subscriptions and change kinds', 'Native transport', 'Reconnect and backoff'],
            ['Offline', 'No native outbox found', 'Native data layer', 'Replay and conflict policy'],
            ['Notifications', 'Attention pull and in-app behavior', 'Connect + push relay', 'Token, revocation, and payload'],
          ]}
        />
      </PageSection>

      <PageSection id="risks-unknowns-non-goals" title="Risks, Unknowns, and non-goals">
        <p>
          <strong>Risks.</strong> Reusing browser cookies could create brittle or
          unsafe session behavior. An offline outbox could resend prompts or tool
          actions. Push payloads could leak thread content. Deep links could open a
          thread without a valid machine or environment. Attachments and voice may
          cross size, permission, and background-execution boundaries that the current
          desktop path handles differently.
        </p>
        <p>
          <strong>Unknowns.</strong> Establish the stable public route subset, native
          handshake, secure-storage implementation, mobile session lifetime, device
          revocation, background limits, and whether the current SDK types compile and
          behave under the selected React Native runtime.
        </p>
        <p>
          <strong>Non-goals.</strong> This proposal does not claim browser or desktop
          behavior is suitable for phones, claim an `apps/mobile` client, promise OS push, add team access, or declare
          every existing endpoint portable. It does not rename Electron safeStorage
          as a generic keychain contract.
        </p>
        <Limits>
          <ul>
            <li>It does not prove a native app, mobile auth header, offline queue, deep-link handler, or push relay exists.</li>
            <li>It does not prove existing API routes support React Native attachments or background execution.</li>
            <li>Future proof would require a native runtime smoke test, authenticated session traces, offline replay tests, and push revocation evidence.</li>
          </ul>
        </Limits>
        <EvidenceCallout
          kind="proposed"
          claim="Future acceptance would require a native session contract and a tested smallest read/send loop before offline or push work."
          explanation="This defines an evidence boundary for later implementation; it is not a delivery claim."
          sourceIds={['mobile-gap', 'native-guide']}
        />
      </PageSection>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
