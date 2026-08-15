import { useState } from 'react'
import { AtAGlance, CodeDisclosure, DataTable, DiagramCard, EvidenceBadge, EvidenceCallout, Limits, PageSection, SourceDisclosure } from '../components/content'
import { SearchDialog } from '../components/search/SearchDialog'
import { galleryPages, gallerySources, successfulDiagram, failingDiagram } from './b02-fixtures'

export default function B02Gallery() {
  const [searchOpen, setSearchOpen] = useState(false)
  return <section className="b02-gallery" aria-labelledby="b02-gallery-title">
    <header className="main-header"><div className="page-eyebrow"><span>B02 fixture</span><span aria-hidden="true">·</span><span>Shared systems</span></div><h1 id="b02-gallery-title" data-route-heading tabIndex={-1}>Component state gallery</h1><p className="page-summary">Owned fixture states for shell, evidence, local search, lazy diagrams, and the accessible large-view dialog.</p><div className="page-meta-row"><span>Rendered evidence only</span><span aria-hidden="true">·</span><span>Not content registry</span></div></header>
    <div className="b02-gallery__actions"><button type="button" className="button button--primary" onClick={() => setSearchOpen(true)}>Open populated Search</button><a className="button" href="#/_b02/gallery#reduced-motion">Reduced-motion target</a></div>
    <div className="content-stack">
      <AtAGlance items={['Observed, Inference, Proposed, and Unknown are distinct.', 'Search data is local fixture metadata.', 'Diagram errors retain text and source fallbacks.']} />
      <PageSection id="evidence" title="Evidence primitives"><div className="b02-gallery__badges">{(['observed', 'inference', 'proposed', 'unknown'] as const).map((label) => <EvidenceBadge key={label} label={label} />)}</div><EvidenceCallout kind="observed" claim="Observed fixture claim." explanation="Source IDs remain visible next to the semantic label." sourceIds={['fixture-source-observed']} /><EvidenceCallout kind="inference" claim="Inference fixture claim." explanation="This state carries its bounded relationship separately." basedOn={['fixture-source-observed', 'fixture-source-inference']} /><EvidenceCallout kind="proposed" claim="Proposed fixture claim." explanation="The amber dashed treatment signals a future state." sourceIds={['fixture-source-inference']} /><EvidenceCallout kind="unknown" claim="Unknown fixture question?" explanation="The current evidence stops here." /></PageSection>
      <PageSection id="content" title="Content component states"><DataTable caption="Fixture table with a keyboard-scrollable wrapper" headers={['State', 'Treatment', 'Text']} rows={[[<EvidenceBadge label="Observed" />, 'Solid edge', 'Current source'], [<EvidenceBadge label="Proposed" />, 'Long dash', 'Future idea']]} /><CodeDisclosure summary="Open fixture excerpt" code={'const state = "source-honest"\nconst fallback = "text alternative"'} /><Limits><li key="limit-1">This gallery is not a teaching page.</li><li key="limit-2">It does not populate the production registry.</li></Limits></PageSection>
      <PageSection id="diagrams" title="Diagram success, error, and text fallback"><DiagramCard definition={successfulDiagram} /><DiagramCard definition={failingDiagram} /><SourceDisclosure sources={gallerySources} /></PageSection>
    </div>
    <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} pages={galleryPages} />
  </section>
}
