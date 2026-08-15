import type { DiagramDefinition, PageMeta, SourceRecord } from '../content/schema'

export const galleryPages: readonly PageMeta[] = [
  { id: 'fixture-send', route: '/_b02/fixture-send', section: 'runtime', navTitle: 'Press Send fixture', title: 'What happens when you press Send', summary: 'Fixture result for local search ranking.', readingOrder: 1, readingMinutes: 3, headings: [{ id: 'queue', title: 'Queue fixture' }], keywords: ['send', 'queue'], searchTerms: ['first message'], evidenceMix: ['observed', 'inference'], relatedPageIds: [] },
  { id: 'fixture-plugin', route: '/_b02/fixture-plugin', section: 'plugins', navTitle: 'Plugin fixture', title: 'What plugins can add', summary: 'Fixture result for local search ranking.', readingOrder: 2, readingMinutes: 3, headings: [{ id: 'surface', title: 'Extension surface' }], keywords: ['plugin', 'extension'], searchTerms: ['add-on'], evidenceMix: ['observed', 'unknown'], relatedPageIds: [] },
  { id: 'fixture-remote', route: '/_b02/fixture-remote', section: 'operations', navTitle: 'Remote fixture', title: 'Where work runs', summary: 'Fixture result for local search ranking.', readingOrder: 3, readingMinutes: 2, headings: [{ id: 'machine', title: 'Machine boundary' }], keywords: ['machine', 'daemon'], searchTerms: ['host'], evidenceMix: ['proposed'], relatedPageIds: [] },
]

export const gallerySources: readonly SourceRecord[] = [
  { id: 'fixture-source-observed', type: 'bb-source', label: 'Observed', statement: 'A bounded source record is shown with a local snapshot fallback.', snapshot: { branch: 'feature/bots', commit: '3a66656a0', dirty: true, observedAt: '2026-08-15' }, path: 'src/fixture/runtime.ts', symbol: 'fixtureBoundary', lineStart: 1, lineEnd: 12, windowSha256: 'fixture', public: { status: 'local-only', url: null, rawUrl: null, verifiedAt: null } },
  { id: 'fixture-source-inference', type: 'bb-source', label: 'Inference', statement: 'Inference retains a visible based-on relationship in the callout.', snapshot: { branch: 'feature/bots', commit: '3a66656a0', dirty: true, observedAt: '2026-08-15' }, path: 'src/fixture/events.ts', symbol: 'fixtureProjection', lineStart: 13, lineEnd: 24, windowSha256: 'fixture', public: { status: 'local-only', url: null, rawUrl: null, verifiedAt: null } },
]

export const successfulDiagram: DiagramDefinition = {
  id: 'b02-success-diagram', title: 'Successful renderer fixture', caption: 'A bounded flow fixture exercises the lazy renderer and text alternative.', evidenceMix: ['observed', 'inference'], sourceIds: ['fixture-source-observed', 'fixture-source-inference'], code: 'graph LR\n  Browser[Browser] --> Server[Server]\n  Server --> Daemon[Host daemon]', textAlternative: 'The fixture shows three boxes in a left-to-right flow. Browser connects to Server, and Server connects to Host daemon. The solid connectors represent the observed boundary. The diagram card also carries an Inference badge to exercise mixed evidence presentation. The surrounding caption and this text alternative remain available even if rendering fails or JavaScript is disabled.'
}

export const failingDiagram: DiagramDefinition = {
  id: 'b02-error-diagram', title: 'Error renderer fixture', caption: 'An unsupported family must fail to an honest text and source fallback.', evidenceMix: ['unknown'], sourceIds: ['fixture-source-inference'], code: 'xychart-beta\n  xychart-beta', textAlternative: 'This fixture intentionally does not render. It represents an unsupported diagram family and should show the error fallback. Readers can still use this complete text alternative: no current shape, node, or edge is asserted by this fixture.'
}
