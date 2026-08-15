import { Link } from 'react-router-dom'
import meta from './home.meta'
import sources from './home.sources.json'
import {
  AtAGlance,
  DiagramCard,
  DocArticle,
  EvidenceCallout,
  Limits,
  PageSection,
  SourceDisclosure,
} from '../../components/content'
import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'

export { meta }

const pageSources = sources as unknown as readonly SourceRecord[]

const homeSpine = defineDiagramDefinition({
  id: 'home-spine',
  title: 'A control surface around local execution',
  caption: 'The app requests work; the server coordinates it; a host daemon runs it near the workspace.',
  evidenceMix: ['observed', 'inference', 'unknown'],
  sourceIds: ['browser-control', 'server-policy', 'daemon-runtime', 'provider-boundary'],
  code: `graph LR
    B[Browser / app] -->|controls| S[BB server]
    S -->|dispatches| H[Host daemon]
    H -->|runs| P[Provider ?]
    S -->|stores state| D[Event DB]
    H -->|works near| W[Workspace files]`,
  textAlternative:
    'Read from left to right. The browser or desktop app sends control intent to the BB server. The server applies policy, stores durable state in an event database, and dispatches execution to a host daemon. The daemon works near the selected workspace and invokes a provider runtime. The provider label ends with a question mark because the inspected host boundary does not establish provider adapter internals or model API behavior. Solid connections are Observed source boundaries; the overall control-surface explanation is an Inference from those boundaries; the provider detail is Unknown.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'BB coordinates agent work around a local server and selected execution host.',
          'The browser or app controls the run; the host daemon performs filesystem and provider work.',
          'Start with the system map, Send path, or visible app anatomy.',
        ]}
      />

      <p>
        Think of BB as the place where a person chooses what should happen, where it should happen, and which agent runtime should receive it. The app is the control surface. The server is the policy and state boundary. A host daemon is the execution-side process that can reach a workspace and provider runtime. Keeping those owners separate prevents a common mistake: assuming the browser itself is running the work.
      </p>
      <EvidenceCallout
        kind="Observed"
        claim="The browser controls BB while the host daemon performs selected work."
        explanation="This is a source boundary, not a claim that every provider, machine, or plugin is available in every installation."
        sourceIds={['browser-control', 'server-policy', 'daemon-runtime']}
      />

      <DiagramCard definition={homeSpine} />
      <p className="diagram-legend">
        Legend: solid = Observed boundary; the complete left-to-right story is Inference; <strong>?</strong> = Unknown provider detail.
      </p>

      <PageSection id="bb-is-local-first" title="BB is a local-first control surface">
        <p>
          “Local-first” describes the default shape, not a promise that every machine is local. The packaged server listens on loopback by default. It holds the public API, policy decisions, and database state, while a selected daemon carries execution context toward the workspace. Managed remote access can add a Connect path, but it does not turn the browser into a provider process.
        </p>
        <p>
          The useful question after any button press is therefore: which owner receives this action next? Read the system map for the boundaries, then follow the Send path for the event sequence. The source evidence is strong about these handoffs and deliberately stops before provider internals.
        </p>
        <EvidenceCallout
          kind="Inference"
          claim="BB is easiest to understand as one control surface coordinating several local owners."
          explanation="That sentence connects the observed browser, server, and daemon boundaries; it does not describe a new runtime architecture."
          basedOn={['browser-control', 'server-policy', 'daemon-runtime']}
        />
      </PageSection>

      <PageSection id="choose-your-path" title="Choose your first question">
        <p>
          If you want to know what happens after pressing Send, read <Link to="/runtime/send-queue-start">What happens when you press Send</Link>. It follows the request through optimistic UI state, server acceptance, queueing, and the start-versus-submit decision.
        </p>
        <p>
          If you want to recognize the product itself, read <Link to="/interface/shell-and-navigation">App shell and navigation</Link>. It explains the sidebar, home composer, thread surface, secondary panels, and route ownership. If you want to judge a statement before trusting it, continue to <Link to="/orientation/source-and-fork">Source snapshot and maintained fork</Link>.
        </p>
        <p>
          These paths meet at the same map. They are not separate BB products: they are three ways to enter the documentation, chosen by the question in front of you.
        </p>
      </PageSection>

      <PageSection id="snapshot-notice" title="This guide is an independent snapshot">
        <p>
          Learning BB is an independent, unofficial learning aid. It describes a dated source snapshot rather than speaking for BB or replacing its product documentation. Source cards show the branch, commit, dirty state, observed date, repository-relative path, symbol, and bounded line window used for a claim.
        </p>
        <p>
          Public links are intentionally conservative. A record may stay unverified when an immutable public file and the same source window cannot be matched. In that case, the honest fallback is a local-snapshot label and a safe repository-relative citation, not a guessed URL.
        </p>
        <EvidenceCallout
          kind="Unknown"
          claim="The public mapping for this inspected snapshot is not established by this page."
          explanation="Treat the source record and its label as the evidence boundary; do not infer a live or official status from the prose."
          sourceIds={['snapshot-notice', 'public-fallback']}
        />
      </PageSection>

      <Limits>
        <ul>
          <li>This map does not prove a provider model call, an authenticated session, or a deployed public site.</li>
          <li>It does not promise that every plugin, machine, provider control, or execution option exists in every configuration.</li>
          <li>Provider adapter internals remain Unknown at the inspected host-daemon boundary.</li>
        </ul>
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
