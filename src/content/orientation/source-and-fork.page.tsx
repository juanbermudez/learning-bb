import meta from './source-and-fork.meta'
import sources from './source-and-fork.sources.json'
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

const citationRefresh = defineDiagramDefinition({
  id: 'citation-refresh',
  title: 'A merge refreshes the citation boundary',
  caption: 'Snapshot identity comes first; public status stays open until the source window matches.',
  evidenceMix: ['observed', 'inference', 'proposed', 'unknown'],
  sourceIds: ['snapshot-record', 'source-record', 'merge-rule', 'public-fallback', 'public-status-unknown'],
  code: `graph LR
    S[Branch + commit + dirty] -->|records| C[Claim + label]
    C -->|audit| P[Public link ?]
    M[Upstream merge] -->|triggers| R[Recheck path + lines]
    R -->|refreshes| F[Fresh citation]
    M -.->|can stale| O[Old window]`,
  textAlternative:
    'Start with the source snapshot: branch, commit, dirty flag, and observed date identify what was read. A claim then receives one visible evidence label. A public link remains marked with a question mark until an immutable public file and matching normalized line window are proven. An upstream merge triggers a recheck of the path, symbol, and lines; it does not prove that the older citation still applies. The old window can become stale, so the maintained process proposes a fresh citation after the check. Solid steps are Observed source or site-contract facts, the merge consequence is an Inference, the refresh process is Proposed, and the unresolved public match is Unknown.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Every claim carries one of four visible truth labels.',
          'A dirty local snapshot can be cited without pretending it is a public link.',
          'After an upstream merge, recheck symbols and windows before refreshing status.',
        ]}
      />

      <p>
        This page defines Learning BB’s reading contract. It separates direct source facts, narrow inferences, future proposals, and unanswered questions. A source card identifies a snapshot; it does not promise clean, public, official, rendered, authenticated, or deployed proof.
      </p>
      <EvidenceCallout
        kind="Observed"
        claim="The current source record uses branch feature/bots, commit 3a66656a0, a dirty flag, and an observed date as snapshot identity."
        explanation="The full commit appears in the source card; the short form is used here for readability."
        sourceIds={['snapshot-record', 'source-record']}
      />

      <DiagramCard definition={citationRefresh} />
      <p className="diagram-legend">
        Legend: solid = Observed; dash-dot = Inference; long dash = Proposed; dotted or <strong>?</strong> = Unknown. Words and stroke patterns carry the distinction together.
      </p>

      <PageSection id="four-labels" title="Four labels answer four different questions">
        <p>
          Read the label first. It describes the proof present and the gap that remains. These labels are not confidence scores and cannot be silently strengthened.
        </p>
        <DataTable
          caption="Evidence labels used by Learning BB"
          headers={['Label', 'Use it when', 'Do not infer']}
          rows={[
            ['Observed', 'The named source directly expresses the claim.', 'A source citation is not rendered, live, or deployed proof.'],
            ['Inference', 'Two or more Observed facts support a narrow connection.', 'The connection cannot promise more than its premises.'],
            ['Proposed', 'The statement describes a desired future feature or architecture.', 'A blueprint is not current behavior.'],
            ['Unknown', 'The inspected evidence stops at a specific unanswered question.', 'Do not replace the gap with analogy or provider lore.'],
          ]}
        />
        <EvidenceCallout
          kind="Inference"
          claim="A citation can be source-proven while the resulting page remains unrendered or unauthenticated."
          explanation="The label describes the source relationship; separate proof states still need separate evidence."
          basedOn={['source-record', 'public-fallback']}
        />
        <EvidenceCallout
          kind="Proposed"
          claim="A future feature remains Proposed until its current seams and missing contracts are shown separately."
          explanation="The proposed label is a guard against turning a maintained-fork idea into a current BB claim."
          sourceIds={['merge-rule', 'source-record']}
        />
      </PageSection>

      <PageSection id="dirty-snapshot" title="A dirty snapshot still needs an honest fallback">
        <p>
          A dirty checkout is not automatically unusable; it means local changes may be present. Each BB source record keeps branch, full commit, dirty state, date, repository-relative path, symbol, and a line window of no more than 80 lines. Those fields identify the inspected code without publishing a machine path or private run pointer.
        </p>
        <p>
          Public status starts as <code>unverified</code>. If an immutable public commit and identical normalized window cannot be proven, the card says “Local snapshot only,” shows the safe path and lines, and omits a guessed URL. That is a truthful fallback, not a failed citation.
        </p>
        <EvidenceCallout
          kind="Unknown"
          claim="The public source mapping for this snapshot is unverified."
          explanation="The page can name the local snapshot and its bounded source window; it cannot claim that a public link resolves to the same bytes."
          sourceIds={['public-status-unknown']}
        />
      </PageSection>

      <PageSection id="freshness-after-merges" title="An upstream merge starts a freshness check">
        <p>
          The previous blueprint baseline and maintained-fork snapshot are not interchangeable. After an upstream merge or rebase, recheck the symbol and line window. An older guide may describe a real idea while pointing at moved or changed source.
        </p>
        <p>
          Keep the fork delta small and reuse public plugin, SDK, and protocol seams. A protocol version changes only when the server-to-daemon wire payload changes; a UI, plugin-policy, or documentation change does not justify a bump by itself.
        </p>
        <EvidenceCallout
          kind="Proposed"
          claim="The maintained process should refresh citations after a merge, not promote the merge itself to feature proof."
          explanation="Rechecking is the proposed maintenance action; the source baseline and protocol constant are the observed anchors."
          sourceIds={['merge-rule', 'snapshot-identity']}
        />
      </PageSection>

      <PageSection id="independent-posture" title="The maintained fork is not official documentation">
        <p>
          Learning BB is independent and unofficial. It uses the maintained fork as dated evidence and rechecks upstream or fork-only changes. It does not copy BB or getbb.app images, logos, CSS, prose, or implementation code. Visual resemblance is a design reference, not provenance.
        </p>
        <p>
          Provider internals, mobile suitability, hosted payload retention, and self-host production details stay Unknown when the source does not establish them. A precise open question is better than a familiar-sounding guess.
        </p>
        <EvidenceCallout
          kind="Unknown"
          claim="The inspected host source does not establish provider-native internals or every post-merge runtime behavior."
          explanation="Keep the unanswered question visible and follow the source link or next page for the boundary that is actually documented."
          sourceIds={['provider-unknown']}
        />
        <EvidenceCallout
          kind="Observed"
          claim="The site’s public posture is independent and unofficial."
          explanation="That status applies to Learning BB itself; it does not describe BB’s ownership or official product documentation."
          sourceIds={['independent-notice']}
        />
      </PageSection>

      <Limits>
        <ul>
          <li>This contract does not make a dirty checkout reproducible; it makes the snapshot boundary visible.</li>
          <li>Unverified public status does not mean the cited source is false; it means the public mapping was not proven.</li>
          <li>A merge, protocol number, or blueprint guide cannot substitute for current source and a bounded claim.</li>
        </ul>
      </Limits>

      <SourceDisclosure sources={pageSources} />
    </DocArticle>
  )
}
