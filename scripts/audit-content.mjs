#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EVIDENCE_LABELS,
  ID_PATTERN,
  PAGE_INVENTORY,
  PROJECT_ROOT,
  contentTriplets,
  failWith,
  parseMeta,
  parsePage,
  scanForbiddenText,
  validateSourceRecord,
  walkFiles,
} from './audit-helpers.mjs'

export function auditContent(projectRoot = PROJECT_ROOT) {
  const errors = []
  const triplets = contentTriplets(projectRoot)
  const contentRoot = path.join(projectRoot, 'src', 'content')
  const authoredFiles = walkFiles(contentRoot).filter((filePath) => /\.(?:meta\.ts|page\.tsx|sources\.json)$/.test(filePath))
  if (authoredFiles.length !== 84) errors.push(`expected 84 authored triplet files, found ${authoredFiles.length}`)

  const ids = new Set(PAGE_INVENTORY.map((page) => page.id))
  const routes = new Set(PAGE_INVENTORY.map((page) => page.route))
  const seenIds = new Set()
  const seenRoutes = new Set()
  const seenOrders = new Set()
  const pageBudgets = []
  let sourceCount = 0
  let diagramCount = 0
  let calloutCount = 0
  let sourceReferenceCount = 0

  for (const triplet of triplets) {
    for (const filePath of [triplet.metaPath, triplet.pagePath, triplet.sourcesPath]) if (!fs.existsSync(filePath)) errors.push(`${triplet.stem}: missing ${path.basename(filePath)}`)
    if (![triplet.metaPath, triplet.pagePath, triplet.sourcesPath].every(fs.existsSync)) continue
    const meta = parseMeta(triplet.metaPath)
    const page = parsePage(triplet.pagePath)
    let sources
    try { sources = JSON.parse(fs.readFileSync(triplet.sourcesPath, 'utf8')) } catch (cause) {
      errors.push(`${triplet.stem}: invalid sources JSON (${cause instanceof Error ? cause.message : String(cause)})`)
      continue
    }
    if (!Array.isArray(sources)) {
      errors.push(`${triplet.stem}: sources JSON must be an array`)
      continue
    }

    for (const field of ['id', 'route', 'section', 'readingOrder']) if (meta[field] !== triplet.expected[field]) errors.push(`${triplet.stem}: ${field} does not match the frozen inventory`)
    if (seenIds.has(meta.id)) errors.push(`${triplet.stem}: duplicate page id ${meta.id}`)
    if (seenRoutes.has(meta.route)) errors.push(`${triplet.stem}: duplicate route ${meta.route}`)
    if (seenOrders.has(meta.readingOrder)) errors.push(`${triplet.stem}: duplicate reading order ${meta.readingOrder}`)
    seenIds.add(meta.id); seenRoutes.add(meta.route); seenOrders.add(meta.readingOrder)

    if (!Array.isArray(meta.headings) || !meta.headings.length) errors.push(`${triplet.stem}: metadata headings are required`)
    else {
      const metadataHeadings = meta.headings.map((heading) => heading.id)
      if (new Set(metadataHeadings).size !== metadataHeadings.length) errors.push(`${triplet.stem}: duplicate metadata heading id`)
      if (metadataHeadings.some((id) => !ID_PATTERN.test(id))) errors.push(`${triplet.stem}: invalid metadata heading id`)
      if (JSON.stringify(metadataHeadings) !== JSON.stringify(page.headings)) errors.push(`${triplet.stem}: rendered PageSection ids do not exactly match metadata headings`)
    }
    if (!Array.isArray(meta.searchTerms) || new Set(meta.searchTerms.map((term) => String(term).trim().toLocaleLowerCase())).size < 3) errors.push(`${triplet.stem}: at least three unique Search synonyms are required`)
    if (!Array.isArray(meta.keywords) || !meta.keywords.length) errors.push(`${triplet.stem}: Search keywords are required`)
    if (!Array.isArray(meta.evidenceMix) || !meta.evidenceMix.length || meta.evidenceMix.some((label) => !EVIDENCE_LABELS.has(label))) errors.push(`${triplet.stem}: page evidenceMix is invalid`)
    if (!Array.isArray(meta.relatedPageIds)) errors.push(`${triplet.stem}: relatedPageIds must be an array`)
    else for (const relatedId of meta.relatedPageIds) {
      if (!ids.has(relatedId)) errors.push(`${triplet.stem}: unknown related page id ${relatedId}`)
      if (relatedId === meta.id) errors.push(`${triplet.stem}: self-related page id is forbidden`)
    }
    if (!page.sourceDisclosure) errors.push(`${triplet.stem}: SourceDisclosure is required`)
    errors.push(...scanForbiddenText(page.source, triplet.stem))

    const sourceIds = new Set()
    for (const [index, record] of sources.entries()) {
      sourceCount += 1
      const label = `${triplet.stem}.sources[${index}]`
      errors.push(...validateSourceRecord(record, label))
      if (sourceIds.has(record.id)) errors.push(`${triplet.stem}: duplicate source id ${record.id}`)
      sourceIds.add(record.id)
    }

    for (const callout of page.callouts) {
      calloutCount += 1
      const kind = typeof callout.kind === 'string' ? callout.kind.toLocaleLowerCase() : ''
      if (!EVIDENCE_LABELS.has(kind)) errors.push(`${triplet.stem}: EvidenceCallout has an invalid kind`)
      if (typeof callout.claim !== 'string' || !callout.claim.trim()) errors.push(`${triplet.stem}: EvidenceCallout claim is required`)
      if (kind === 'inference' && (!Array.isArray(callout.basedOn) || callout.basedOn.length < 2)) errors.push(`${triplet.stem}: Inference callout requires at least two observed premises`)
      if (['observed', 'unknown', 'proposed'].includes(kind) && (!Array.isArray(callout.sourceIds) || callout.sourceIds.length < 1)) errors.push(`${triplet.stem}: ${kind} callout requires sourceIds`)
      for (const sourceId of [...(callout.sourceIds ?? []), ...(callout.basedOn ?? [])]) {
        sourceReferenceCount += 1
        if (!sourceIds.has(sourceId)) errors.push(`${triplet.stem}: callout references unknown source id ${sourceId}`)
      }
    }
    if (page.diagrams.length !== triplet.expected.diagrams) errors.push(`${triplet.stem}: expected ${triplet.expected.diagrams} diagrams, found ${page.diagrams.length}`)
    for (const diagram of page.diagrams) {
      diagramCount += 1
      if (!ID_PATTERN.test(diagram.id ?? '')) errors.push(`${triplet.stem}: diagram id must be lowercase kebab-case`)
      if (!Array.isArray(diagram.sourceIds) || !diagram.sourceIds.length) errors.push(`${triplet.stem}: diagram sourceIds are required`)
      if (!Array.isArray(diagram.evidenceMix) || !diagram.evidenceMix.length || diagram.evidenceMix.some((label) => !EVIDENCE_LABELS.has(label))) errors.push(`${triplet.stem}: diagram evidenceMix is invalid`)
      if (typeof diagram.caption !== 'string' || !diagram.caption.trim()) errors.push(`${triplet.stem}: diagram caption is required`)
      if (typeof diagram.textAlternative !== 'string' || !diagram.textAlternative.trim()) errors.push(`${triplet.stem}: diagram text alternative is required`)
      for (const sourceId of diagram.sourceIds ?? []) {
        sourceReferenceCount += 1
        if (!sourceIds.has(sourceId)) errors.push(`${triplet.stem}: diagram references unknown source id ${sourceId}`)
      }
    }
    for (const link of page.links.filter((item) => item.kind === 'route')) if (!routes.has(link.value)) errors.push(`${triplet.stem}: Link points to unknown route ${link.value}`)
    pageBudgets.push({ id: meta.id, words: page.proseWords, min: triplet.expected.minWords, max: triplet.expected.maxWords })
    if (page.proseWords < triplet.expected.minWords || page.proseWords > triplet.expected.maxWords) errors.push(`${triplet.stem}: prose count ${page.proseWords} is outside ${triplet.expected.minWords}-${triplet.expected.maxWords}`)
  }

  if (seenIds.size !== 28 || seenRoutes.size !== 28 || seenOrders.size !== 28) errors.push('inventory must contain 28 unique ids, routes, and reading orders')
  if (diagramCount !== 37) errors.push(`expected 37 authored diagrams, found ${diagramCount}`)
  return { errors, pages: triplets.length, authoredFiles: authoredFiles.length, sources: sourceCount, diagrams: diagramCount, callouts: calloutCount, sourceReferences: sourceReferenceCount, pageBudgets }
}

export function main() {
  const result = auditContent()
  if (result.errors.length) return failWith(result.errors, 'Content integration audit failed')
  console.log(`Content audit passed: ${result.pages} pages, ${result.authoredFiles} triplet files, ${result.sources} source records, ${result.diagrams} diagrams, ${result.callouts} evidence callouts, ${result.sourceReferences} explicit source references; all page budgets pass.`)
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
