import { Link } from 'react-router-dom'
import meta from './system-map.meta'
import sources from './system-map.sources.json'
import {
  AtAGlance,
  DataTable,
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

const systemMap = defineDiagramDefinition({
  id: 'system-map',
  title: 'Eight owners, one control path',
  caption: 'BB separates control, policy, storage, execution, extension, and remote-access responsibilities.',
  evidenceMix: ['observed', 'unknown'],
  sourceIds: [
    'browser-control',
    'server-listener',
    'event-rows',
    'runtime-owner',
    'thread-storage',
    'plugin-surfaces',
    'connect-tunnel',
    'provider-internals',
  ],
  code: `graph LR
    B[Browser / app] -->|controls| S[BB server]
    S -->|stores rows| D[Event DB]
    S -->|dispatches| H[Host daemon]
    H -->|reads and writes| W[Workspace storage]
    H -->|runs| P[Provider runtime ?]
    S -->|loads| X[Plugins]
    S -->|tunnels| C[Connect]
    C -->|serves| R[Remote client]`,
  textAlternative:
    'Read from left to right. The browser or desktop app sends control requests to the BB server. The server stores durable event rows in the event database and dispatches execution to a host daemon. The daemon reads and writes workspace or thread storage and owns the live runtime entry. The provider runtime is the next boundary, marked with a question mark because adapter internals are not established here. Plugins attach through server or UI extension seams. Connect is a remote-access tunnel that can carry a browser or daemon path toward the server and registered shares. Solid connections are Observed; the question mark marks Unknown provider detail.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The browser or app sends control; it does not execute provider work.',
          'The server owns policy and state; the daemon owns execution near a workspace.',
          'Event rows, thread storage, plugins, and Connect are separate seams.',
        ]}
      />

      <p>
        Start with ownership rather than product vocabulary. “The app,” “the server,” “the daemon,” and “the provider” are not interchangeable names for one process. BB uses them to mark different jobs and trust boundaries. The database records events; thread storage holds files needed by a runtime; plugins add bounded surfaces; Connect carries selected remote traffic.
      </p>
      <DiagramCard definition={systemMap} />
      <p className="diagram-legend">
        Legend: solid = Observed boundary; <strong>?</strong> = Unknown provider internals. A box can be current without making its internal implementation fully known.
      </p>

      <PageSection id="control-and-policy" title="Control begins in the browser or app">
        <p>
          The browser or desktop app is where a person chooses a project, prompt, provider, model, permission, and execution environment. It sends that intent to the server. The server is the policy boundary that accepts or rejects the request and prepares the command sent to a host. This is why “the browser runs the agent” is the wrong mental model.
        </p>
        <EvidenceCallout
          kind="Observed"
          claim="The local default puts the server on loopback while the host daemon remains the execution-side process."
          explanation="Remote operation adds another transport path; it does not erase the local ownership split."
          sourceIds={['browser-control', 'server-listener']}
        />
        <p>
          The local browser origin guard is a browser-request boundary, not proof of user identity. The full remote trust model belongs on <Link to="/operations/remote-access-machines">Remote access and machines</Link>, where account sessions, machine credentials, and host keys are kept distinct.
        </p>
      </PageSection>

      <PageSection id="owners-and-storage" title="The server, database, and daemon have different jobs">
        <p>
          Use this table as a vocabulary check. A durable row is not the same thing as a live process, and a workspace file is not the same thing as the event log that describes work.
        </p>
        <DataTable
          caption="Current ownership boundaries in the inspected source snapshot"
          headers={['Owner or seam', 'Primary job', 'Boundary to keep']}
          rows={[
            ['Browser / app', 'Collects intent and shows projections', 'Control surface, not provider execution'],
            ['BB server', 'Policy, commands, API, and lifecycle effects', 'Coordinates; does not become the provider'],
            ['Event DB', 'Stores accepted and returned event rows', 'Durable record, not a live runtime'],
            ['Host daemon', 'Stages inputs and owns a runtime entry', 'Execution host, not the browser UI'],
            ['Workspace / thread storage', 'Holds workspace and thread files', 'Files are separate from event rows'],
            ['Provider runtime', 'Receives host runtime calls', 'Adapter and model internals are Unknown'],
          ]}
        />
        <EvidenceCallout
          kind="Inference"
          claim="A reader should follow the event row and storage paths separately before describing BB as one persistent process."
          explanation="The distinction follows from server event insertion, runtime ownership, and separate thread-storage roots."
          basedOn={['event-rows', 'runtime-owner', 'thread-storage']}
        />
      </PageSection>

      <PageSection id="extensions-and-connect" title="Plugins and Connect extend the boundary">
        <p>
          Plugins are additions at registered seams. The current UI registration set includes surfaces such as homepage sections, settings sections, navigation panels, composer customizations, and thread actions. The host still owns the surrounding shell and failure boundary; a plugin does not automatically own the database, provider, or global navigation.
        </p>
        <p>
          Connect is a transport boundary for managed remote access. Its tunnel can carry browser traffic or a remote daemon path toward the local server and registered shares. That makes Connect part of the map, not a replacement for server policy or daemon credentials. Read <Link to="/interface/settings-and-extensions">Settings and Extensions</Link> for UI ownership, then the operations page for the security gates.
        </p>
        <EvidenceCallout
          kind="Observed"
          claim="Plugins and Connect add controlled paths around the host-owned system."
          explanation="The sources establish registration and tunneling seams; they do not grant plugins direct model or host-database ownership."
          sourceIds={['plugin-surfaces', 'connect-tunnel']}
        />
        <EvidenceCallout
          kind="Unknown"
          claim="The provider adapter’s internal loop, model API calls, token accounting, and checkpoint format are not established here."
          explanation="Stop at the host runtime boundary instead of filling that gap with a generic provider story."
          sourceIds={['provider-internals']}
        />
      </PageSection>

      <Limits>
        <ul>
          <li>This map does not prove a particular provider, plugin, host, or Connect account is enabled or reachable.</li>
          <li>It does not describe the complete security runbook for self-hosted Connect or the retention of tunneled payloads.</li>
          <li>It does not turn event storage into proof that a live provider process survived a restart.</li>
        </ul>
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
