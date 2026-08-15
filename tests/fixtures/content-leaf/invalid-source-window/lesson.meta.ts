import { definePageMeta } from '../../../../src/content/schema'
export default definePageMeta({
  id: 'invalid-window', route: '/runtime/invalid-window', section: 'runtime', navTitle: 'Invalid window',
  title: 'Invalid source window fixture', summary: 'This valid-length summary exists only to exercise the inclusive source-window limit and reject a range outside the frozen contract. Every other field remains deterministic, bounded, and suitable for a focused validator test for downstream workers and acceptance evidence in this release.',
  readingOrder: 11, readingMinutes: 2, headings: [{ id: 'window', title: 'Window' }], keywords: ['fixture'], searchTerms: ['line window'], evidenceMix: ['observed'], relatedPageIds: [],
})
