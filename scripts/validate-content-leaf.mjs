#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const EVIDENCE_LABELS = new Set(['observed', 'inference', 'proposed', 'unknown'])
const EVIDENCE_LABEL_TEXT = new Set(['Observed', 'Inference', 'Proposed', 'Unknown'])
const SOURCE_TYPES = new Set([
  'bb-source',
  'official-external',
  'rendered-reference',
  'proposal-guide',
])
const SOURCE_STATUSES = new Set(['verified', 'local-only', 'unverified'])
const SECTIONS = new Set([
  'orientation',
  'runtime',
  'interface',
  'plugins',
  'foundations',
  'operations',
  'blueprints',
])
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ROUTE_PATTERN = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/
const PRIVATE_PATH_PATTERN = /(^|[\s"'`])(\/Users\/|\/home\/|[A-Za-z]:[\\/]|file:\/\/|~\/)/

function usage() {
  console.log(`Usage: node scripts/validate-content-leaf.mjs [directory]

Validates one content directory (or every immediate content section when the
directory contains only section directories) using the frozen page-triplet,
metadata, evidence, and source-window contract.`)
}

function fail(errors, message) {
  errors.push(message)
}

function countWords(value) {
  return value.trim() === '' ? 0 : value.trim().split(/\s+/u).length
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }
  return null
}

function evaluateLiteral(node) {
  if (ts.isParenthesizedExpression(node)) return evaluateLiteral(node.expression)
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
    return evaluateLiteral(node.expression)
  }
  if (ts.isSatisfiesExpression(node)) return evaluateLiteral(node.expression)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const value = evaluateLiteral(node.operand)
    return typeof value === 'number' ? -value : undefined
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => evaluateLiteral(element))
  }
  if (ts.isObjectLiteralExpression(node)) {
    const value = {}
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) return undefined
      if (!ts.isPropertyAssignment(property)) return undefined
      const key = propertyName(property.name)
      if (key === null) return undefined
      value[key] = evaluateLiteral(property.initializer)
    }
    return value
  }
  return undefined
}

function readPageMeta(filePath, errors) {
  const source = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  let metadataNode
  sourceFile.forEachChild((node) => {
    if (!ts.isExportAssignment(node) || !ts.isCallExpression(node.expression)) return
    if (node.expression.arguments.length !== 1) return
    metadataNode = node.expression.arguments[0]
  })
  if (!metadataNode) {
    fail(errors, `${filePath}: expected default definePageMeta({...}) export`)
    return null
  }
  const metadata = evaluateLiteral(metadataNode)
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    fail(errors, `${filePath}: metadata must be a static object literal`)
    return null
  }
  return metadata
}

function validateSafeRepositoryPath(value, label, errors) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(errors, `${label}: repository-relative path is required`)
    return
  }
  if (
    value.startsWith('/') ||
    value.startsWith('~') ||
    value.includes('\\') ||
    value.includes('://') ||
    value.split('/').includes('..') ||
    PRIVATE_PATH_PATTERN.test(value)
  ) {
    fail(errors, `${label}: absolute, private, or non-portable path is forbidden`)
  }
}

function validateLineWindow(record, label, errors) {
  const hasStart = record.lineStart !== undefined
  const hasEnd = record.lineEnd !== undefined
  if (!hasStart && !hasEnd) return
  if (!hasStart || !hasEnd) {
    fail(errors, `${label}: lineStart and lineEnd must be provided together`)
    return
  }
  if (
    !Number.isInteger(record.lineStart) ||
    !Number.isInteger(record.lineEnd) ||
    record.lineStart < 1 ||
    record.lineEnd < record.lineStart ||
    record.lineEnd - record.lineStart + 1 > 80
  ) {
    fail(errors, `${label}: source window must be an inclusive 1-80 line range`)
  }
}

function validateSnapshot(snapshot, label, errors) {
  if (!snapshot || typeof snapshot !== 'object') {
    fail(errors, `${label}: snapshot is required`)
    return
  }
  for (const key of ['branch', 'commit', 'observedAt']) {
    if (typeof snapshot[key] !== 'string' || snapshot[key].trim() === '') {
      fail(errors, `${label}.snapshot.${key}: non-empty string is required`)
    }
  }
  if (typeof snapshot.dirty !== 'boolean') {
    fail(errors, `${label}.snapshot.dirty: boolean is required`)
  }
}

function validatePublicState(publicState, label, errors) {
  if (publicState === undefined) return
  if (!publicState || typeof publicState !== 'object') {
    fail(errors, `${label}.public: object is required`)
    return
  }
  if (!SOURCE_STATUSES.has(publicState.status)) {
    fail(errors, `${label}.public.status: invalid source status`)
  }
  for (const key of ['url', 'rawUrl', 'verifiedAt']) {
    if (publicState[key] !== null && typeof publicState[key] !== 'string') {
      fail(errors, `${label}.public.${key}: string or null is required`)
    }
  }
}

function validateSourceRecord(record, filePath, index, errors) {
  const label = `${filePath}[${index}]`
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    fail(errors, `${label}: source record must be an object`)
    return
  }
  if (typeof record.id !== 'string' || !ID_PATTERN.test(record.id)) {
    fail(errors, `${label}.id: lowercase kebab-case id is required`)
  }
  if (!SOURCE_TYPES.has(record.type)) fail(errors, `${label}.type: invalid source type`)
  if (!EVIDENCE_LABEL_TEXT.has(record.label)) {
    fail(errors, `${label}.label: must be Observed, Inference, Proposed, or Unknown`)
  }
  if (typeof record.statement !== 'string' || record.statement.trim() === '') {
    fail(errors, `${label}.statement: one non-empty claim is required`)
  }
  if (record.path !== undefined) validateSafeRepositoryPath(record.path, `${label}.path`, errors)
  if (record.type === 'bb-source') {
    validateSnapshot(record.snapshot, label, errors)
    if (typeof record.symbol !== 'string' || record.symbol.trim() === '') {
      fail(errors, `${label}.symbol: non-empty symbol is required for bb-source`)
    }
    if (typeof record.path !== 'string') fail(errors, `${label}.path: required for bb-source`)
    validateLineWindow(record, label, errors)
    if (record.lineStart === undefined || record.lineEnd === undefined) {
      fail(errors, `${label}: lineStart and lineEnd are required for bb-source`)
    }
    if (typeof record.windowSha256 !== 'string' || record.windowSha256.trim() === '') {
      fail(errors, `${label}.windowSha256: string is required for bb-source`)
    }
    if (record.public === undefined) fail(errors, `${label}.public: required for bb-source`)
    validatePublicState(record.public, label, errors)
  } else {
    validateLineWindow(record, label, errors)
    if (record.public !== undefined) validatePublicState(record.public, label, errors)
    if (record.url !== undefined && typeof record.url !== 'string') {
      fail(errors, `${label}.url: string is required when provided`)
    }
    if (record.retrievedAt !== undefined && typeof record.retrievedAt !== 'string') {
      fail(errors, `${label}.retrievedAt: string is required when provided`)
    }
  }
}

function validateMetadata(meta, filePath, errors) {
  const requiredStrings = ['id', 'route', 'section', 'navTitle', 'title', 'summary']
  for (const key of requiredStrings) {
    if (typeof meta[key] !== 'string' || meta[key].trim() === '') {
      fail(errors, `${filePath}.${key}: non-empty string is required`)
    }
  }
  if (typeof meta.id === 'string' && !ID_PATTERN.test(meta.id)) {
    fail(errors, `${filePath}.id: lowercase kebab-case id is required`)
  }
  if (typeof meta.route === 'string' && !ROUTE_PATTERN.test(meta.route)) {
    fail(errors, `${filePath}.route: invalid hash-router leaf path`)
  }
  if (typeof meta.section === 'string' && !SECTIONS.has(meta.section)) {
    fail(errors, `${filePath}.section: unknown content section`)
  }
  if (typeof meta.summary === 'string' && (countWords(meta.summary) < 40 || countWords(meta.summary) > 80)) {
    fail(errors, `${filePath}.summary: must contain 40-80 words`)
  }
  if (!Number.isInteger(meta.readingOrder) || meta.readingOrder < 1) {
    fail(errors, `${filePath}.readingOrder: positive integer is required`)
  }
  if (!Number.isInteger(meta.readingMinutes) || meta.readingMinutes < 2 || meta.readingMinutes > 4) {
    fail(errors, `${filePath}.readingMinutes: integer from 2-4 is required`)
  }
  if (!Array.isArray(meta.headings)) {
    fail(errors, `${filePath}.headings: array is required`)
  } else {
    const headingIds = new Set()
    for (const [index, heading] of meta.headings.entries()) {
      if (!heading || typeof heading !== 'object' || typeof heading.id !== 'string' || typeof heading.title !== 'string') {
        fail(errors, `${filePath}.headings[${index}]: id and title are required`)
        continue
      }
      if (!ID_PATTERN.test(heading.id)) fail(errors, `${filePath}.headings[${index}].id: invalid heading id`)
      if (headingIds.has(heading.id)) fail(errors, `${filePath}: duplicate heading id ${heading.id}`)
      headingIds.add(heading.id)
    }
  }
  for (const key of ['keywords', 'searchTerms']) {
    if (!Array.isArray(meta[key]) || meta[key].some((term) => typeof term !== 'string' || term.trim() === '')) {
      fail(errors, `${filePath}.${key}: non-empty string array is required`)
    }
  }
  if (!Array.isArray(meta.evidenceMix) || meta.evidenceMix.length === 0) {
    fail(errors, `${filePath}.evidenceMix: at least one evidence label is required`)
  } else {
    const labels = new Set()
    for (const label of meta.evidenceMix) {
      if (!EVIDENCE_LABELS.has(label)) fail(errors, `${filePath}.evidenceMix: invalid evidence label ${String(label)}`)
      if (labels.has(label)) fail(errors, `${filePath}.evidenceMix: duplicate evidence label ${String(label)}`)
      labels.add(label)
    }
  }
  if (!Array.isArray(meta.relatedPageIds) || meta.relatedPageIds.length > 3) {
    fail(errors, `${filePath}.relatedPageIds: array of at most three ids is required`)
  } else {
    for (const id of meta.relatedPageIds) {
      if (typeof id !== 'string' || !ID_PATTERN.test(id)) fail(errors, `${filePath}.relatedPageIds: invalid page id`)
    }
  }
}

function validateLeaf(directory) {
  const errors = []
  const absoluteDirectory = path.resolve(directory)
  if (!fs.existsSync(absoluteDirectory)) {
    fail(errors, `${absoluteDirectory}: directory does not exist`)
    return errors
  }
  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true })
  const directFiles = entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
  const metaFiles = directFiles.filter((name) => name.endsWith('.meta.ts'))
  if (metaFiles.length === 0) {
    const childDirectories = entries.filter((entry) => entry.isDirectory())
    if (childDirectories.length === 0) {
      return errors
    }
    for (const child of childDirectories) errors.push(...validateLeaf(path.join(absoluteDirectory, child.name)))
    return errors
  }

  const allStems = new Set()
  for (const name of directFiles) {
    const match = name.match(/^(.+)\.(meta\.ts|page\.tsx|sources\.json)$/)
    if (match) allStems.add(match[1])
  }
  const seenRoutes = new Map()
  const seenOrders = new Map()
  for (const stem of [...allStems].sort()) {
    const metaPath = path.join(absoluteDirectory, `${stem}.meta.ts`)
    const pagePath = path.join(absoluteDirectory, `${stem}.page.tsx`)
    const sourcesPath = path.join(absoluteDirectory, `${stem}.sources.json`)
    for (const required of [metaPath, pagePath, sourcesPath]) {
      if (!fs.existsSync(required)) fail(errors, `${absoluteDirectory}: missing triplet file ${path.basename(required)}`)
    }
    if (!fs.existsSync(metaPath)) continue
    const meta = readPageMeta(metaPath, errors)
    if (!meta) continue
    validateMetadata(meta, metaPath, errors)
    if (typeof meta.route === 'string') {
      if (seenRoutes.has(meta.route)) fail(errors, `${absoluteDirectory}: duplicate route ${meta.route}`)
      seenRoutes.set(meta.route, stem)
    }
    if (Number.isInteger(meta.readingOrder)) {
      if (seenOrders.has(meta.readingOrder)) fail(errors, `${absoluteDirectory}: duplicate reading order ${meta.readingOrder}`)
      seenOrders.set(meta.readingOrder, stem)
    }
    if (fs.existsSync(pagePath)) {
      const pageText = fs.readFileSync(pagePath, 'utf8')
      if (PRIVATE_PATH_PATTERN.test(pageText)) fail(errors, `${pagePath}: absolute or private path is forbidden`)
      if (!pageText.includes(`./${stem}.meta`)) fail(errors, `${pagePath}: page must import its metadata triplet`)
      if (!pageText.includes(`./${stem}.sources.json`)) fail(errors, `${pagePath}: page must import its sources triplet`)
    }
    if (!fs.existsSync(sourcesPath)) continue
    let sources
    try {
      sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'))
    } catch (error) {
      fail(errors, `${sourcesPath}: invalid JSON (${error.message})`)
      continue
    }
    if (!Array.isArray(sources)) {
      fail(errors, `${sourcesPath}: source file must contain an array`)
      continue
    }
    const sourceIds = new Set()
    for (const [index, record] of sources.entries()) {
      validateSourceRecord(record, sourcesPath, index, errors)
      if (record && typeof record.id === 'string') {
        if (sourceIds.has(record.id)) fail(errors, `${sourcesPath}: duplicate source id ${record.id}`)
        sourceIds.add(record.id)
      }
    }
  }
  return errors
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  usage()
  process.exit(0)
}

const targetDirectory = process.argv.slice(2).find((argument) => !argument.startsWith('-')) ?? 'src/content'
const errors = validateLeaf(targetDirectory)
if (errors.length > 0) {
  console.error(`Content leaf validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log(`Content leaf validation passed: ${path.resolve(targetDirectory)}`)
