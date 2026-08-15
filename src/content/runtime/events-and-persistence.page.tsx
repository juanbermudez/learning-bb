import { defineDiagramDefinition, type SourceRecord } from '../../content/schema'
import meta from './events-and-persistence.meta'
import sourcesData from './events-and-persistence.sources.json'
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

const sources = sourcesData as readonly SourceRecord[]

const eventIngressDiagram = defineDiagramDefinition({
  id: 'event-ingress',
  title: 'Events become stored rows',
  caption: 'The daemon posts provider events; the server transaction creates durable rows and lifecycle effects.',
  evidenceMix: ['observed'],
  sourceIds: ['provider-events', 'sink-delivery', 'server-ingress', 'stored-row', 'lifecycle-effects'],
  code: `graph LR
  Provider[Provider events] --> Sink[Daemon event sink]
  Sink --> Ingress[Session events]
  Ingress --> Tx[Server transaction]
  Tx --> Rows[Stored event rows]
  Tx --> Effects[Lifecycle effects]`,
  textAlternative:
    'Read left to right. Provider-originated events enter the host daemon event sink. The sink batches, retries, or immediately flushes selected events, then posts grouped envelopes to the server session-events endpoint. The server authenticates the active daemon session, checks thread ownership, maps each envelope to a stored row, and appends the batch in one transaction. That transaction also makes lifecycle effects such as run status changes or queued follow-up handling. Stored rows are the durable event input for later reads; they are not the same thing as the daemon’s in-memory pending queue.',
})

const projectionDiagram = defineDiagramDefinition({
  id: 'timeline-projection',
  title: 'The UI reads a bounded projection',
  caption: 'Stored events feed a bounded read model; WebSocket changes prompt the app to refresh that model.',
  evidenceMix: ['observed', 'inference', 'unknown'],
  sourceIds: ['stored-row', 'timeline-window', 'timeline-output', 'outline-projection', 'realtime-subscription', 'delta-query', 'hub-broadcast'],
  code: `graph LR
  Rows[Stored event rows] --> Window[Bounded read window]
  Window --> Projection[Timeline projection ?]
  Projection --> Timeline[Timeline rows]
  Timeline --> App[App cache]
  Hub[WebSocket event] --> App
  Rows --> Outline[Conversation outline]`,
  textAlternative:
    'Read from stored rows toward the app. The server selects a bounded event and byte window, reads request context and usage, and sends the selected data through the timeline projection boundary. The resulting timeline rows and a separate conversation outline are read models, not the raw event log. The app keeps a cached high-water sequence and can ask for a delta. A WebSocket event tells the app that relevant data changed. The question mark marks the imported projection internals: the source establishes its inputs and outputs, not every row-collapse rule. The visible result is therefore a projection refreshed from durable server state.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The daemon posts provider events through a server-owned session endpoint.',
          'Stored rows feed timeline and outline read models.',
          'WebSocket invalidation repairs the app from a later server sequence.',
        ]}
      />

      <p>
        A timeline row has a longer path than a screen repaint. Provider-originated
        events reach the daemon sink, the server commits them, and lifecycle effects
        update thread state. Only then does the app learn that its cached read model
        may be stale. This gives the system two useful views: durable event history
        and a bounded, readable projection.
      </p>

      <DiagramCard definition={eventIngressDiagram} />

      <PageSection id="event-ingress" title="The daemon delivers event envelopes">
        <p>
          <strong>Observed.</strong> Provider events carry a provider session id and
          typed lifecycle data. The daemon event sink flushes turn boundaries,
          errors, interruptions, and approval waits promptly; other events can be
          debounced. It retries transient post failures and can split permanently
          invalid batches so one bad event does not block other threads.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="The daemon posts grouped event envelopes to the server’s internal session-events endpoint."
          explanation="The current session id travels with the post; the server, rather than the app, is the event-ingress authority."
          sourceIds={['provider-events', 'sink-delivery', 'post-events']}
        />
        <p>
          The sink’s pending queue is memory-only. It can remain available across a
          closed socket and retry after reconnect, but a daemon process crash drops
          items that were not posted. That is a persistence boundary, not a claim
          that all provider output is immediately durable.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="A daemon crash can lose pending event-sink items even when earlier server rows remain."
          explanation="The queue lifetime is shorter than the server event-row lifetime."
          sourceIds={['sink-memory-queue']}
        />
      </PageSection>

      <PageSection id="stored-effects" title="The server stores rows and applies effects">
        <p>
          <strong>Observed.</strong> Server ingress authenticates the active daemon
          session, rejects events for threads not owned by that host, adds server
          labels where needed, and appends the batch in one immediate transaction.
          Provider and turn or item events receive a provider id; client and system
          events such as <code>client/turn/requested</code> and
          <code>system/error</code> intentionally do not.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Stored event rows preserve common event fields beside the payload and can be parsed back into typed thread events."
          explanation="The latest stored provider id can then be used for a later submit or runtime resume."
          sourceIds={['server-ingress', 'provider-identifiers', 'stored-row', 'stored-read']}
        />
        <p>
          After insertion, the server broadcasts <code>events-appended</code>
          metadata and applies effects. A turn can move run status, notify a parent,
          or release a deferred queued message. A provider-process exit becomes a
          failure path. These effects explain why one event write can change more
          than one visible field.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Event persistence and lifecycle effects are part of the same server ingress boundary."
          explanation="The accepted response includes event sequence information that downstream reads can use."
          sourceIds={['lifecycle-effects']}
        />
      </PageSection>

      <PageSection id="timeline-projection" title="The timeline is a bounded read projection">
        <p>
          <strong>Observed.</strong> Timeline construction selects a bounded event
          window, loads accepted and rejected request context, decodes rows,
          summarizes eligible events, attaches context-window usage, and calls the
          imported thread-view projection. The response includes rows, a maximum
          sequence, activity state, goals, usage, and page cursors. A conversation
          outline is a separate lightweight projection for navigation.
        </p>
        <DiagramCard definition={projectionDiagram} />
        <EvidenceCallout
          kind="inference"
          claim="The visible timeline is not the raw event log."
          explanation="It is built from selected stored rows, bounded and summarized for reading; the durable log remains a separate source."
          basedOn={['stored-row', 'timeline-window', 'timeline-output']}
        />
        <p>
          The server also caches timeline responses for its process lifetime and can
          return a row delta when the client’s prior sequence still matches. If the
          base is stale, the client falls back to a full fetch. That is a read-model
          optimization, not a change to the stored event history.
        </p>
        <EvidenceCallout
          kind="unknown"
          claim="The imported thread-view package’s exact row-collapse rules are Unknown."
          explanation="The inspected source proves the selected inputs and returned projection contract, not every internal grouping decision."
          sourceIds={['projection-boundary']}
        />
      </PageSection>

      <PageSection id="realtime-repair" title="WebSocket changes trigger cache repair">
        <p>
          <strong>Observed.</strong> A mounted thread detail subscribes to its
          thread-detail channel. The app schedules registered invalidations for an
          <code>events-appended</code> change, including timeline, activity, search,
          and prompt-history queries. The server hub broadcasts the change to
          matching sockets and wakes event waiters.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="An optimistic row can be temporarily ahead of, or stale relative to, the server projection."
          explanation="The repair path is a later timeline query at a server event sequence, using a delta when possible and a full read when the cached base is stale."
          basedOn={['realtime-subscription', 'delta-query', 'hub-broadcast', 'timeline-output']}
        />
        <p>
          A disconnected WebSocket can delay that repair. Readers should therefore
          distinguish “the app displayed a row,” “the server stored an event,” and
          “the app reloaded a projected row.” They are related states, not three names
          for one raw record.
        </p>
      </PageSection>

      <Limits>
        <li>The timeline projection does not prove that every raw provider event is shown one-for-one.</li>
        <li>WebSocket invalidation is a refresh signal, not proof that the browser currently has the newest rows.</li>
        <li>The source does not establish the exact internal summarization rules of the imported thread-view package.</li>
      </Limits>
      <SourceDisclosure sources={sources} />
    </DocArticle>
  )
}
