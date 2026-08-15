import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const inventoryRows = [
  ['home', '/', 'orientation', 1, 450, 600, 1],
  ['orientation-system-map', '/orientation/system-map', 'orientation', 2, 500, 700, 1],
  ['orientation-source-and-fork', '/orientation/source-and-fork', 'orientation', 3, 500, 650, 1],
  ['runtime-send-queue-start', '/runtime/send-queue-start', 'runtime', 4, 650, 800, 2],
  ['runtime-agent-input', '/runtime/agent-input', 'runtime', 5, 600, 750, 1],
  ['runtime-runtime-boundaries', '/runtime/runtime-boundaries', 'runtime', 6, 500, 650, 1],
  ['runtime-events-and-persistence', '/runtime/events-and-persistence', 'runtime', 7, 650, 800, 2],
  ['runtime-failure-restart-compaction', '/runtime/failure-restart-compaction', 'runtime', 8, 650, 800, 2],
  ['interface-shell-and-navigation', '/interface/shell-and-navigation', 'interface', 9, 550, 700, 1],
  ['interface-start-a-thread', '/interface/start-a-thread', 'interface', 10, 600, 750, 1],
  ['interface-timeline-and-follow-up', '/interface/timeline-and-follow-up', 'interface', 11, 600, 750, 1],
  ['interface-panels-files-environment', '/interface/panels-files-environment', 'interface', 12, 550, 700, 1],
  ['interface-settings-and-extensions', '/interface/settings-and-extensions', 'interface', 13, 550, 700, 1],
  ['interface-responsive-and-electron', '/interface/responsive-and-electron', 'interface', 14, 550, 700, 1],
  ['plugins-model-and-lifecycle', '/plugins/model-and-lifecycle', 'plugins', 15, 600, 750, 1],
  ['plugins-backend-powers', '/plugins/backend-powers', 'plugins', 16, 700, 850, 2],
  ['plugins-ui-surface-atlas', '/plugins/ui-surface-atlas', 'plugins', 17, 700, 850, 2],
  ['plugins-compatibility-trust-fallbacks', '/plugins/compatibility-trust-fallbacks', 'plugins', 18, 650, 800, 1],
  ['foundations-rules-skills-tools', '/foundations/rules-skills-tools', 'foundations', 19, 650, 800, 2],
  ['foundations-context-memory-goals', '/foundations/context-memory-goals', 'foundations', 20, 650, 800, 2],
  ['foundations-compaction-and-windowing', '/foundations/compaction-and-windowing', 'foundations', 21, 500, 650, 1],
  ['operations-remote-access-machines', '/operations/remote-access-machines', 'operations', 22, 700, 850, 2],
  ['operations-self-hosting-security', '/operations/self-hosting-security', 'operations', 23, 700, 850, 2],
  ['blueprints-interaction-agent', '/blueprints/interaction-agent', 'blueprints', 24, 600, 750, 1],
  ['blueprints-multitenancy-sync', '/blueprints/multitenancy-sync', 'blueprints', 25, 650, 800, 1],
  ['blueprints-ui-library-navigation', '/blueprints/ui-library-navigation', 'blueprints', 26, 600, 750, 1],
  ['blueprints-react-native-companion', '/blueprints/react-native-companion', 'blueprints', 27, 650, 800, 1],
  ['blueprints-connector-registry', '/blueprints/connector-registry', 'blueprints', 28, 650, 800, 1],
]

export const PAGE_INVENTORY = Object.freeze(inventoryRows.map(([id, route, section, readingOrder, minWords, maxWords, diagrams]) => ({ id, route, section, readingOrder, minWords, maxWords, diagrams })))
export const EVIDENCE_LABELS = new Set(['observed', 'inference', 'proposed', 'unknown'])
export const EVIDENCE_LABEL_TEXT = new Set(['Observed', 'Inference', 'Proposed', 'Unknown'])
export const SOURCE_TYPES = new Set(['bb-source', 'official-external', 'rendered-reference', 'proposal-guide'])
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const SHA256_PATTERN = /^[a-f0-9]{64}$/
export const PLACEHOLDER_HASH = 'TO_BE_COMPUTED_BY_SOURCE_AUDIT'

const FORBIDDEN_TEXT_PATTERNS = [
  [/\/(?:Users|home)\/[A-Za-z0-9._-]+\//, 'absolute private home path'],
  [/[A-Za-z]:[\\/](?:Users|Documents and Settings)[\\/]/, 'absolute private Windows path'],
  [/\bfile:\/\//i, 'file URL'],
  [/(?:^|[\s"'`])~\//m, 'home-directory shorthand'],
  [/\bthr_[a-z0-9]{6,}\b/i, 'private thread id'],
  [/\bLBB-\d+\b/, 'private task id'],
  [/project-context\/runs\//i, 'private run-ledger path'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key material'],
  [/\b(?:ghp_|github_pat_|sk-)[A-Za-z0-9_-]{16,}\b/, 'credential-shaped token'],
  [/\b(?:javascript|vbscript):/i, 'unsafe executable URL scheme'],
  [/\bdata:text\/html/i, 'unsafe HTML data URL'],
]

export function walkFiles(directory) {
  const files = []
  if (!fs.existsSync(directory)) return files
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(filePath))
    else if (entry.isFile()) files.push(filePath)
  }
  return files
}

export function scanForbiddenText(text, label) {
  const errors = []
  for (const [pattern, description] of FORBIDDEN_TEXT_PATTERNS) if (pattern.test(text)) errors.push(`${label}: contains ${description}`)
  return errors
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text
  return null
}

export function evaluateLiteral(node) {
  if (!node) return undefined
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node)) return evaluateLiteral(node.expression)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(evaluateLiteral)
  if (ts.isObjectLiteralExpression(node)) {
    const result = {}
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) return undefined
      const key = propertyName(property.name)
      if (key === null) return undefined
      result[key] = evaluateLiteral(property.initializer)
    }
    return result
  }
  return undefined
}

function jsxAttributes(node, sourceFile) {
  const attributes = {}
  for (const attribute of node.attributes.properties) {
    if (!ts.isJsxAttribute(attribute)) continue
    const key = attribute.name.getText(sourceFile)
    if (!attribute.initializer) attributes[key] = true
    else if (ts.isStringLiteral(attribute.initializer)) attributes[key] = attribute.initializer.text
    else if (ts.isJsxExpression(attribute.initializer)) attributes[key] = evaluateLiteral(attribute.initializer.expression)
  }
  return attributes
}

export function parseMeta(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  if (sourceFile.parseDiagnostics.length) throw new Error(`${filePath}: TypeScript parse error`)
  let metadata
  sourceFile.forEachChild((node) => {
    if (ts.isExportAssignment(node) && ts.isCallExpression(node.expression)) metadata = evaluateLiteral(node.expression.arguments[0])
  })
  if (!metadata || typeof metadata !== 'object') throw new Error(`${filePath}: static default metadata export not found`)
  return metadata
}

export function parsePage(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const facts = { source, headings: [], callouts: [], diagrams: [], links: [], sourceDisclosure: false, proseChunks: [] }
  if (sourceFile.parseDiagnostics.length) throw new Error(`${filePath}: TypeScript parse error`)
  const excludedVisibleComponents = new Set(['DataTable', 'DiagramCard', 'SourceDisclosure', 'CodeDisclosure'])
  function visit(node, excludeVisibleText = false) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'defineDiagramDefinition') {
      const definition = evaluateLiteral(node.arguments[0])
      if (!definition || typeof definition !== 'object') throw new Error(`${filePath}: diagram definition must be a pure literal`)
      facts.diagrams.push(definition)
      return
    }
    let excludeChildren = excludeVisibleText
    if (ts.isJsxElement(node)) {
      const tag = node.openingElement.tagName.getText(sourceFile)
      if (excludedVisibleComponents.has(tag) || tag === 'nav') excludeChildren = true
    }
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(sourceFile)
      const attributes = jsxAttributes(node, sourceFile)
      if (tag === 'PageSection' && typeof attributes.id === 'string') facts.headings.push(attributes.id)
      if (tag === 'EvidenceCallout') {
        facts.callouts.push(attributes)
        for (const key of ['claim', 'explanation']) if (typeof attributes[key] === 'string') facts.proseChunks.push(attributes[key])
      }
      if (tag === 'AtAGlance' && Array.isArray(attributes.items)) facts.proseChunks.push(...attributes.items.filter((item) => typeof item === 'string'))
      if (tag === 'SourceDisclosure') facts.sourceDisclosure = true
      if (tag === 'Link' && typeof attributes.to === 'string') facts.links.push({ kind: 'route', value: attributes.to })
      if (tag === 'a' && typeof attributes.href === 'string') facts.links.push({ kind: 'href', value: attributes.href })
      if (excludedVisibleComponents.has(tag) || tag === 'nav') excludeChildren = true
    }
    if (!excludeVisibleText && ts.isJsxText(node)) facts.proseChunks.push(node.text)
    if (!excludeVisibleText && ts.isJsxExpression(node) && node.expression && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))) facts.proseChunks.push(node.expression.text)
    ts.forEachChild(node, (child) => visit(child, excludeChildren))
  }
  visit(sourceFile)
  facts.proseWords = facts.proseChunks.join(' ').trim().split(/\s+/u).filter(Boolean).length
  return facts
}

export function contentTriplets(projectRoot = PROJECT_ROOT) {
  const root = path.join(projectRoot, 'src', 'content')
  return PAGE_INVENTORY.map((expected) => {
    const routeStem = expected.route === '/' ? path.join('orientation', 'home') : expected.route.slice(1)
    const stem = expected.section === 'blueprints' ? path.join(routeStem, expected.route.split('/').at(-1)) : routeStem
    return {
      expected,
      stem: stem.split(path.sep).join('/'),
      metaPath: path.join(root, `${stem}.meta.ts`),
      pagePath: path.join(root, `${stem}.page.tsx`),
      sourcesPath: path.join(root, `${stem}.sources.json`),
    }
  })
}

export function normalizeWindow(fileText, lineStart, lineEnd) {
  const lines = fileText.replace(/\r\n?/g, '\n').split('\n')
  if (lineEnd > lines.length) throw new Error(`line window ${lineStart}-${lineEnd} exceeds ${lines.length} normalized lines`)
  const selected = lines.slice(lineStart - 1, lineEnd).join('\n')
  return lineEnd < lines.length ? `${selected}\n` : selected
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function validateSafeRelativePath(value, label) {
  const errors = []
  if (typeof value !== 'string' || !value.trim()) return [`${label}: non-empty repository-relative path is required`]
  if (path.isAbsolute(value) || value.startsWith('~') || value.includes('\\') || value.includes('://') || value.split('/').includes('..')) errors.push(`${label}: absolute, private, remote, or non-portable path is forbidden`)
  errors.push(...scanForbiddenText(value, label))
  return errors
}

export function validateSourceRecord(record, label) {
  const errors = []
  if (!record || typeof record !== 'object' || Array.isArray(record)) return [`${label}: source record must be an object`]
  if (typeof record.id !== 'string' || !ID_PATTERN.test(record.id)) errors.push(`${label}.id: lowercase kebab-case id is required`)
  if (!SOURCE_TYPES.has(record.type)) errors.push(`${label}.type: unsupported source type`)
  if (!EVIDENCE_LABEL_TEXT.has(record.label)) errors.push(`${label}.label: visible evidence label is required`)
  if (typeof record.statement !== 'string' || !record.statement.trim()) errors.push(`${label}.statement: one claim is required`)
  else errors.push(...scanForbiddenText(record.statement, `${label}.statement`))
  if (record.path !== undefined) errors.push(...validateSafeRelativePath(record.path, `${label}.path`))
  if (record.lineStart !== undefined || record.lineEnd !== undefined) {
    if (!Number.isInteger(record.lineStart) || !Number.isInteger(record.lineEnd) || record.lineStart < 1 || record.lineEnd < record.lineStart || record.lineEnd - record.lineStart + 1 > 80) errors.push(`${label}: line window must be an inclusive 1-80 line range`)
  }
  if (record.type === 'bb-source') {
    if (!record.snapshot || typeof record.snapshot !== 'object') errors.push(`${label}.snapshot: required for bb-source`)
    if (typeof record.symbol !== 'string' || !record.symbol.trim()) errors.push(`${label}.symbol: required for bb-source`)
    if (record.lineStart === undefined || record.lineEnd === undefined) errors.push(`${label}: bounded line window is required for bb-source`)
    if (record.windowSha256 !== PLACEHOLDER_HASH && !SHA256_PATTERN.test(record.windowSha256 ?? '')) errors.push(`${label}.windowSha256: expected the audit placeholder or SHA-256`)
    if (!record.public || record.public.status !== 'unverified' || record.public.url !== null || record.public.rawUrl !== null || record.public.verifiedAt !== null) errors.push(`${label}.public: authored BB source state must remain unverified with null public fields`)
  } else if (record.public) {
    if (record.public.status === 'verified') {
      if (!record.public.url || !record.public.rawUrl || !record.public.verifiedAt) errors.push(`${label}.public: verified state requires URL, raw URL, and date`)
    } else if (record.public.url !== null || record.public.rawUrl !== null || record.public.verifiedAt !== null) errors.push(`${label}.public: non-verified source must not expose a public link`)
  }
  for (const value of [record.url, record.public?.url, record.public?.rawUrl]) if (typeof value === 'string') errors.push(...scanForbiddenText(value, `${label}.url`))
  return errors
}

export function failWith(errors, heading) {
  if (!errors.length) return
  console.error(`${heading} with ${errors.length} error(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
}
