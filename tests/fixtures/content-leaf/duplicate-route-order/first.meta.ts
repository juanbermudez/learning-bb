import { definePageMeta } from '../../../../src/content/schema'
export default definePageMeta({
  id: 'first-page', route: '/runtime/same', section: 'runtime', navTitle: 'First',
  title: 'First duplicate fixture', summary: 'This valid-length summary exists only to exercise duplicate route and reading order checks in the directory-scoped validator fixture. The page is otherwise complete, portable, and safe for a focused negative test used by downstream workers.',
  readingOrder: 8, readingMinutes: 2, headings: [{ id: 'first', title: 'First' }], keywords: ['fixture'], searchTerms: ['duplicate'], evidenceMix: ['observed'], relatedPageIds: [],
})
