import meta from './compaction-and-windowing.meta'
import sources from './compaction-and-windowing.sources.json'
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

const sourceRecords = sources as unknown as readonly SourceRecord[]

const compactionAndWindows = defineDiagramDefinition({
  id: 'compaction-windowing-boundaries',
  title: 'Provider state and server display have separate bounds',
  caption: 'A provider command changes provider state; server windows and summaries shape what the UI reads.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: [
    'provider-context-usage',
    'manual-compaction-route',
    'compaction-events',
    'timeline-window',
    'timeline-summary',
    'durable-event-rows',
  ],
  code: `flowchart LR
  usage["Provider context usage"] --> provider["Provider state"]
  compact["Manual compaction"] --> provider
  provider --> events["Provider events"]
  rows["Durable event rows"] --> projection["Server projection"]
  window["Timeline event and byte window"] --> projection
  summary["Display summary reduction"] --> projection
  events --> projection
  projection --> ui["Visible timeline"]`,
  textAlternative:
    'The left and right halves answer different questions. Provider context usage reports tokens and model-window information about provider state. Manual compaction is a provider command; its completion is represented by provider events. Separately, durable event rows feed a server projection. The projection applies event and byte bounds, and it may reduce summary events for a visible timeline page. Inference: a bounded timeline display is not a provider prompt measured in the same units. The arrows meet at visible timeline output, but the provider state change and the server read-side shaping remain separate contracts.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed — provider context usage reports tokens and model-window state.',
          'Observed — provider compaction is a provider command or turn with lifecycle events.',
          'Observed — timeline windows and summary reduction are server read/display projections.',
        ]}
      />

      <EvidenceCallout
        kind="observed"
        claim="Provider context usage, provider compaction, timeline windows, and display summaries are separate source-backed mechanisms."
        explanation="Use provider context usage to discuss the provider’s capacity and current use. Use compaction for a provider action. Use timeline windows and summaries for server reads and visible rows."
        sourceIds={['provider-context-usage', 'manual-compaction-route', 'timeline-window', 'timeline-summary']}
      />

      <DiagramCard definition={compactionAndWindows} />

      <PageSection id="three-windows" title="Three windows answer different questions">
        <EvidenceCallout
          kind="observed"
          claim="Provider context usage carries used tokens, model context window, and whether the value is estimated or unknown."
          explanation="Those fields describe provider-side context capacity. They do not count timeline rows or describe how many events the server will render in one page."
          sourceIds={['provider-context-usage', 'context-usage-event']}
        />
        <EvidenceCallout
          kind="observed"
          claim="The server timeline uses an event budget, segment and byte bounds, and sequence cursors to limit read-side projection."
          explanation="The feature flag’s default event budget is 1,500. A timeline page is therefore a bounded display/read unit, not a token budget."
          sourceIds={['timeline-budget', 'timeline-window', 'timeline-byte-window']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — a page showing 1,500 events is not a 1,500-token provider prompt."
          explanation="The two measurements have different owners, units, and purposes. Label them as provider context usage and timeline display window instead of collapsing both into context."
          basedOn={['provider-context-usage', 'timeline-budget', 'timeline-window']}
        />
      </PageSection>

      <PageSection id="provider-compaction" title="Manual compaction is a provider action">
        <EvidenceCallout
          kind="observed"
          claim="The compact route is allowed only for an idle or errored thread and sends a standalone built-in compact request."
          explanation="This is an active provider operation. It is not a page-size control and it is not the same as reducing rows in a server projection."
          sourceIds={['manual-compaction-route']}
        />
        <EvidenceCallout
          kind="observed"
          claim="Manual compaction support differs by provider, and completion is represented by a thread/compacted provider event."
          explanation="The catalog advertises support for Codex, Claude Code, Pi, and OpenCode ACP, but not Cursor or custom ACP. A provider event is the evidence boundary for saying that provider compaction occurred."
          sourceIds={['manual-compaction-support', 'compaction-events']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown — the inspected BB source does not establish the provider’s summarization algorithm or context-replacement semantics."
          explanation="BB can request and record provider compaction without proving how each provider rewrites its internal conversation state."
          sourceIds={['manual-compaction-route', 'compaction-events']}
        />
      </PageSection>

      <PageSection id="display-summary" title="Read-side summaries optimize display">
        <EvidenceCallout
          kind="observed"
          claim="The timeline builder applies compactThreadTimelineSummaryEvents during server projection."
          explanation="This operation reduces the event-shaped material used for a read model. It does not call the provider’s manual compaction route."
          sourceIds={['timeline-summary']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — a display summary is not proof that the provider compacted its conversation."
          explanation="Provider compaction needs its own provider lifecycle event. A timeline summary can exist even when the provider has not changed its context state."
          basedOn={['timeline-summary', 'compaction-events']}
        />
      </PageSection>

      <PageSection id="restart-persistence" title="Restart preserves records, not every process detail">
        <EvidenceCallout
          kind="observed"
          claim="The server appends authenticated daemon events as durable rows, while thread storage remains separate from live runtime processes."
          explanation="Runtime shutdown clears process-local provider entries without destroying the workspace. Stored events and thread files can therefore be inputs to a later reconstruction."
          sourceIds={['durable-event-rows', 'thread-storage', 'runtime-shutdown']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — restart recovery rebuilds from durable history and identifiers; it does not promise an identical hidden provider context."
          explanation="The persistence boundary is strong for records and storage paths. Provider-native cache behavior after a restart remains outside the proven BB contract."
          basedOn={['durable-event-rows', 'thread-storage', 'runtime-shutdown']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="Unknown — the scoped source does not prove that every provider-native cache or checkpoint survives a daemon restart."
          explanation="It proves that BB retains event rows, thread storage, and identifiers used for resume; provider-specific internal persistence is a separate question."
          sourceIds={['thread-storage', 'runtime-shutdown']}
        />
      </PageSection>

      <Limits>
        <li><strong>Inference.</strong> Do not call a timeline event or byte window provider compaction. Sources: timeline-window, manual-compaction-route.</li>
        <li><strong>Inference.</strong> Do not call a display summary a changed provider context without a provider compaction event. Sources: timeline-summary, compaction-events.</li>
        <li><strong>Observed.</strong> Provider context usage is a usage report, not a guarantee about the provider’s internal summarization behavior. Sources: provider-context-usage, context-usage-event.</li>
      </Limits>

      <SourceDisclosure sources={sourceRecords} />
    </DocArticle>
  )
}
