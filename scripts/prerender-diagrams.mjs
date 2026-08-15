#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import ts from 'typescript'
import { renderMermaidSVG } from 'beautiful-mermaid'
import { sanitizeDiagramSvg, validateDiagramSource } from '../src/components/diagram/diagramSanitizer.mjs'

export const EXPECTED_DIAGRAM_COUNT = 37

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, '..')
const RENDER_OPTIONS = {
  bg: 'var(--surface)',
  fg: 'var(--ink)',
  line: 'var(--line-strong)',
  accent: 'var(--accent)',
  muted: 'var(--ink-muted)',
  surface: 'var(--surface-subtle)',
  border: 'var(--line-strong)',
  transparent: true,
  font: 'Inter, ui-sans-serif, sans-serif',
  padding: 32,
  nodeSpacing: 24,
  layerSpacing: 40,
}
const REQUIRED_FIELDS = ['id', 'title', 'caption', 'evidenceMix', 'sourceIds', 'code', 'textAlternative']

function extractionError(sourceFile, node, message) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  const relative = path.relative(PROJECT_ROOT, sourceFile.fileName)
  return new Error(`B02C S2: ${relative}:${position.line + 1}:${position.character + 1}: ${message}`)
}

function literalString(sourceFile, node, label) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  throw extractionError(sourceFile, node, `${label} must be a string literal without substitutions.`)
}

function literalStringArray(sourceFile, node, label) {
  if (!ts.isArrayLiteralExpression(node) || node.elements.some((element) => !element || ts.isSpreadElement(element))) {
    throw extractionError(sourceFile, node, `${label} must be an array of string literals without spreads.`)
  }
  return node.elements.map((element, index) => literalString(sourceFile, element, `${label}[${index}]`))
}

function propertyKey(sourceFile, property) {
  if (!property.name || ts.isComputedPropertyName(property.name)) throw extractionError(sourceFile, property, 'computed properties are not allowed.')
  if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) return property.name.text
  throw extractionError(sourceFile, property, 'property names must be literal identifiers or strings.')
}

function literalDefinition(sourceFile, call) {
  if (call.arguments.length !== 1 || !ts.isObjectLiteralExpression(call.arguments[0])) {
    throw extractionError(sourceFile, call, 'defineDiagramDefinition requires one object-literal argument.')
  }
  const object = call.arguments[0]
  const values = new Map()
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) throw extractionError(sourceFile, property, 'definition properties must be direct literal assignments.')
    const key = propertyKey(sourceFile, property)
    if (values.has(key)) throw extractionError(sourceFile, property, `duplicate definition property ${key}.`)
    values.set(key, property.initializer)
  }
  for (const key of REQUIRED_FIELDS) {
    if (!values.has(key)) throw extractionError(sourceFile, object, `definition is missing literal property ${key}.`)
  }
  for (const key of values.keys()) {
    if (!REQUIRED_FIELDS.includes(key)) throw extractionError(sourceFile, object, `unknown definition property ${key}.`)
  }
  return {
    id: literalString(sourceFile, values.get('id'), 'id'),
    title: literalString(sourceFile, values.get('title'), 'title'),
    caption: literalString(sourceFile, values.get('caption'), 'caption'),
    evidenceMix: literalStringArray(sourceFile, values.get('evidenceMix'), 'evidenceMix'),
    sourceIds: literalStringArray(sourceFile, values.get('sourceIds'), 'sourceIds'),
    code: literalString(sourceFile, values.get('code'), 'code'),
    textAlternative: literalString(sourceFile, values.get('textAlternative'), 'textAlternative'),
  }
}

function collectPageFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectPageFiles(filePath))
    else if (entry.isFile() && entry.name.endsWith('.page.tsx')) files.push(filePath)
  }
  return files
}

export function extractDefinitions(projectRoot = PROJECT_ROOT) {
  const contentRoot = path.join(projectRoot, 'src', 'content')
  const files = collectPageFiles(contentRoot)
  if (files.length !== 28) throw new Error(`B02C S2: expected 28 *.page.tsx files, found ${files.length}.`)
  const definitions = []
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8')
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    if (sourceFile.parseDiagnostics.length > 0) throw extractionError(sourceFile, sourceFile, 'the page has TypeScript parse errors.')
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'defineDiagramDefinition') {
        definitions.push({ ...literalDefinition(sourceFile, node), filePath })
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  if (definitions.length !== EXPECTED_DIAGRAM_COUNT) throw new Error(`B02C S2: expected exactly ${EXPECTED_DIAGRAM_COUNT} literal diagram definitions, found ${definitions.length}.`)
  const ids = new Set()
  const codes = new Set()
  for (const definition of definitions) {
    if (ids.has(definition.id)) throw new Error(`B02C S2: duplicate diagram key ${definition.id}.`)
    if (codes.has(definition.code)) throw new Error(`B02C S2: duplicate diagram source for ${definition.id}.`)
    ids.add(definition.id)
    codes.add(definition.code)
  }
  return definitions.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
}

function renderDefinitions(definitions) {
  const dom = new JSDOM('')
  const purifier = createDOMPurify(dom.window)
  const parser = new dom.window.DOMParser()
  try {
    return definitions.map((definition) => {
      try {
        const source = validateDiagramSource(definition.code)
        const rendered = renderMermaidSVG(source, RENDER_OPTIONS)
        const svg = sanitizeDiagramSvg(rendered, purifier, parser)
        const hash = crypto.createHash('sha256').update(svg).digest('hex').slice(0, 24)
        return { ...definition, svg, filename: `diagram-${hash}.svg` }
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new Error(`B02C S3: ${definition.id}: ${message}`, { cause })
      }
    })
  } finally {
    dom.window.close()
  }
}

function writeOutputs(entries, projectRoot = PROJECT_ROOT) {
  const assetRoot = path.join(projectRoot, 'public', 'diagrams')
  const manifestPath = path.join(projectRoot, 'src', 'generated', 'diagram-manifest.ts')
  fs.rmSync(assetRoot, { recursive: true, force: true })
  fs.mkdirSync(assetRoot, { recursive: true })
  for (const entry of entries) fs.writeFileSync(path.join(assetRoot, entry.filename), `${entry.svg}\n`, 'utf8')

  const manifestLines = [
    '// Generated by scripts/prerender-diagrams.mjs. Do not edit.',
    'const baseUrl = import.meta.env.BASE_URL',
    '',
    'export const diagramManifest: Readonly<Record<string, string>> = Object.freeze({',
  ]
  for (const entry of entries) manifestLines.push(`  ${JSON.stringify(entry.code)}: \`${'${baseUrl}'}diagrams/${entry.filename}\`,`)
  manifestLines.push('})', '')
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  fs.writeFileSync(manifestPath, `${manifestLines.join('\n')}\n`, 'utf8')
}

export function prerenderDiagrams(projectRoot = PROJECT_ROOT) {
  const definitions = extractDefinitions(projectRoot)
  const entries = renderDefinitions(definitions)
  writeOutputs(entries, projectRoot)
  return entries
}

export function main(projectRoot = PROJECT_ROOT) {
  const entries = prerenderDiagrams(projectRoot)
  console.log(`Pre-rendered ${entries.length} diagrams to public/diagrams and src/generated/diagram-manifest.ts.`)
  return entries
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : cause)
    process.exitCode = 1
  }
}
