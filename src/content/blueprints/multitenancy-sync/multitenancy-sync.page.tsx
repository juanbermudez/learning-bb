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
import meta from './multitenancy-sync.meta'
import sources from './multitenancy-sync.sources.json'

export { meta }

const pageSources = sources as unknown as readonly SourceRecord[]

const syncDiagram = defineDiagramDefinition({
  id: 'multitenancy-sync-boundaries',
  title: 'Observed local durability, Proposed cloud coordination',
  caption: 'Local event ownership is solid; organization, mirroring, handoff, and conflict policy are dashed proposals.',
  evidenceMix: ['observed', 'inference', 'proposed', 'unknown'],
  sourceIds: ['sqlite-wal', 'event-sequence', 'connect-identity', 'cloud-gap', 'freshness-audit'],
  code: `flowchart LR
classDef observed fill:var(--surface),stroke:var(--line-strong),stroke-width:1.5px
classDef inference fill:var(--surface-subtle),stroke:var(--evidence-inference),stroke-width:1.5px,stroke-dasharray:8 3 2 3
classDef proposed fill:var(--surface-subtle),stroke:var(--evidence-proposed),stroke-width:1.5px,stroke-dasharray:9 6
classDef unknown fill:var(--surface-subtle),stroke:var(--evidence-unknown),stroke-width:1.5px,stroke-dasharray:2 5
local["Observed: SQLite WAL"] --> events["Observed: Event log"]
events --> identity["Observed: Connect identity"]
events -.-> mirror["Proposed: Cloud mirror"]
org["Proposed: Org grants"] -.-> mirror
epoch["Proposed: Epoch key"] -.-> mirror
mirror -.-> handoff["Proposed: Handoff"]
tomb["Proposed: Tombstones"] -.-> mirror
policy["Unknown: Conflict policy"] -.-> handoff
effect["Inference: Exactly-once effect"] -.-> mirror
class local,events,identity observed
class org,epoch,mirror,handoff,tomb proposed
class policy unknown
class effect inference`,
  textAlternative: 'Read left to right. SQLite WAL and the server-owned event log are Observed local foundations. Connect identity and routing are another Observed boundary, but the current path does not show a cloud event writer. The cloud mirror, organization grants, epoch key, handoff, and tombstone nodes are Proposed and connect with dashed arrows. Conflict policy is Unknown because the inspected source does not define concurrent writers or a tenant authorization contract. “Exactly-once effect” is an Inference from a possible sequence key and idempotent consumer design; it is not a current guarantee. The picture therefore separates local durability from the coordination work needed before a team thread can move between machines.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed: SQLite WAL, server-owned event sequences, resume context, soft deletion, and Connect identity routing.',
          'Proposed: organization grants, cloud event mirroring, epochs, tombstones, handoff, and conflict rules.',
          'Inference: an exactly-once effect needs idempotency; Unknown: who may read, write, retain, or delete shared history.',
        ]}
      />

      <EvidenceCallout
        kind="proposed"
        claim="Proposal only: a sync layer would extend local event durability across an organization boundary."
        explanation="The inspected source does not contain cloud thread mirroring or organization tables. Protocol 119 remains the observed daemon version; a website proposal does not bump it."
        sourceIds={['freshness-audit', 'sync-guide']}
      />

      <PageSection id="observed-current-seams" title="Observed current seams">
        <p>
          <strong>User outcome.</strong> A reader should leave knowing that a durable
          local timeline and a team-sync product are different systems. The database
          uses SQLite with write-ahead logging and foreign keys. Event rows carry a
          server-owned sequence boundary per thread, rather than accepting sequence
          or status labels from a caller.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The server owns accepted event sequences and uses provider identity from stored events when it rebuilds resume context."
          explanation="This is a strong local append and restart seam, but it is still scoped to a local thread and its host runtime."
          sourceIds={['sqlite-wal', 'event-sequence', 'server-sequence-assignment', 'resume-provider']}
        />
        <p>
          Thread deletion is represented locally through a soft deletion field and
          cascades. Connect supplies identity and routing, while its inspected schema
          does not show organization, membership, or mirrored BB thread and event
          tables. Its better-auth account rows are identity records, not evidence of
          synchronized product history.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The daemon wire constant is HOST_DAEMON_PROTOCOL_VERSION 119, and Connect currently supplies identity/routing rather than BB event replication."
          explanation="The older guide’s protocol 123 wording is stale. A version change belongs only to a real server-to-daemon payload change."
          sourceIds={['protocol-119', 'connect-identity', 'connect-accounts']}
        />
        <nav aria-label="Current page backlinks">
          <p><strong>Current-page backlinks.</strong> Read the present foundations first:</p>
          <ul>
            <li><Link to="/runtime/events-and-persistence">How events become the timeline</Link></li>
            <li><Link to="/operations/remote-access-machines">Remote access and machines</Link></li>
            <li><Link to="/runtime/failure-restart-compaction">Failure, restart, and compaction</Link></li>
          </ul>
        </nav>
      </PageSection>

      <PageSection id="explicit-gap" title="The explicit gap">
        <p>
          Sync needs more than copying event rows. It needs an organization and
          membership model, a grant check for each thread or project, actor identity,
          a cloud ownership rule, and a deletion and retention contract. It also needs
          an epoch or handoff rule so two machines do not silently make conflicting
          writes against one thread.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The current source does not establish tenant authorization, human actor attribution, cloud retention, conflict resolution, or a sync writer."
          explanation="Those answers cannot be filled by treating Connect identity as a team data model or by treating a local sequence as a distributed sequence."
          sourceIds={['connect-identity', 'connect-accounts', 'freshness-audit']}
        />
        <p>
          An idempotency key such as `(thread, epoch, sequence)` can be a useful
          design candidate. The effect is an <strong>Inference</strong>, not a promise:
          a key can make retries recognizable, but it cannot by itself prove that
          external side effects happened once, that the actor was authorized, or that
          a deletion reached every copy.
        </p>
      </PageSection>

      <PageSection id="proposed-smallest-path" title="Proposed smallest path">
        <DiagramCard definition={syncDiagram} />
        <p>
          <strong>Proposed.</strong> Start with a server-owned event-log read/append
          seam and Connect’s identity boundary. Add organization, membership, and
          access-grant records before adding a cloud mirror. Give every replicated
          thread an explicit epoch, retain tombstones long enough to explain deletes,
          and make one machine the admitted writer during a handoff. Treat conflict
          resolution as a product rule with a visible outcome, not a database retry.
        </p>
        <p>
          <strong>Legend.</strong> <EvidenceBadge label="Observed" /> is a solid
          1.5px stroke; <EvidenceBadge label="Inference" /> is dash-dot `8 3 2 3`;
          <EvidenceBadge label="Proposed" /> is dashed `9 6`; <EvidenceBadge label="Unknown" />
          is dotted `2 5`. Every status is written in node text as well as encoded by
          its pattern.
        </p>
        <DataTable
          caption="Ownership boundaries for the smallest proposed sync path"
          headers={['Area', 'Observed seam', 'Proposed owner', 'Missing decision']}
          rows={[
            ['Local events', 'SQLite WAL and server sequence', 'BB server', 'Cloud append contract'],
            ['Identity', 'Connect user/session/account rows', 'Connect + registry', 'Tenant and actor model'],
            ['Access', 'No org membership table found', 'Server policy', 'Membership and grants'],
            ['Movement', 'Machine enrollment and resume context', 'Handoff service', 'Epoch and writer rule'],
            ['Deletion', 'Local deletedAt and cascades', 'Sync policy', 'Tombstone and retention'],
          ]}
        />
      </PageSection>

      <PageSection id="risks-unknowns-non-goals" title="Risks, Unknowns, and non-goals">
        <p>
          <strong>Risks.</strong> Copying local events before actor and tenant checks
          are defined could expose work across an organization. A cloud mirror could
          also turn local deletion into a false sense of erasure if tombstones,
          retention, exports, and downstream caches are not one policy. A handoff that
          only changes a client flag can still race with an active provider session.
        </p>
        <p>
          <strong>Unknowns.</strong> Decide whether the first version is one server
          with multiple members, several servers joined by a hosted service, or a
          narrower machine-roaming feature. Define who may see provider identities,
          queued messages, attachments, and tool results before designing a mirror.
        </p>
        <p>
          <strong>Non-goals.</strong> This proposal does not claim that BB has
          organization tables, cloud event replication, shared human actor fields,
          conflict handling, or distributed exactly-once behavior. It does not change
          protocol 119 merely to make a page diagram look future-ready.
        </p>
        <Limits>
          <ul>
            <li>It does not prove Connect stores BB thread or event product data.</li>
            <li>It does not prove a sequence key gives an exactly-once external effect.</li>
            <li>Future proof would require multi-writer tests, deletion readbacks, authorization traces, and restart/handoff evidence.</li>
          </ul>
        </Limits>
        <EvidenceCallout
          kind="proposed"
          claim="Future acceptance would require an actor-aware append contract, explicit retention behavior, and a tested handoff policy."
          explanation="Those are implementation proof conditions, not claims about the inspected BB snapshot."
          sourceIds={['freshness-audit', 'sync-guide']}
        />
      </PageSection>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
