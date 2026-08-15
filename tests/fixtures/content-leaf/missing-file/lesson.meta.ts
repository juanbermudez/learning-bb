import { definePageMeta } from '../../../../src/content/schema'

export default definePageMeta({
  id: 'missing-source',
  route: '/runtime/missing-source',
  section: 'runtime',
  navTitle: 'Missing source',
  title: 'Missing source fixture',
  summary:
    'This fixture intentionally omits one adjacent source file so the validator can prove that every authored page has a complete triplet. The surrounding metadata remains valid so the missing-file diagnostic is isolated, easy to audit, and useful to downstream workers.',
  readingOrder: 5,
  readingMinutes: 2,
  headings: [{ id: 'missing', title: 'Missing source' }],
  keywords: ['fixture'],
  searchTerms: ['missing file'],
  evidenceMix: ['observed'],
  relatedPageIds: [],
})
