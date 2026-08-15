import { definePageMeta } from '../../../../src/content/schema'

export default definePageMeta({
  id: 'fixture-lesson',
  route: '/runtime/fixture-lesson',
  section: 'runtime',
  navTitle: 'Fixture lesson',
  title: 'A valid fixture lesson',
  summary:
    'This fixture demonstrates a complete page contract with stable metadata, readable navigation, evidence labels, source references, and a bounded route definition for validator tests. It remains deliberately small, deterministic, and independent from any authored product page or shared registry used by downstream consumers.',
  readingOrder: 4,
  readingMinutes: 2,
  headings: [{ id: 'first-section', title: 'The first section' }],
  keywords: ['fixture', 'runtime'],
  searchTerms: ['example lesson', 'validator sample'],
  evidenceMix: ['observed'],
  relatedPageIds: [],
})
