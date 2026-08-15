#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

const BUDGETS = {
  initialShellJs: 140 * 1024,
  initialCss: 35 * 1024,
  initialTransfer: 190 * 1024,
  routeChunk: 45 * 1024,
  diagramChunk: 90 * 1024,
  searchMetadata: 30 * 1024,
  initialRequests: 12,
}

const VITE_BASE = '/learning-bb/'

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB gzip`
}

function printHelp() {
  console.log(`Usage: node scripts/check-budgets.mjs [dist-directory]

Checks the committed production dist/ output against the Learning BB budgets:
  initial shell JavaScript       140 KiB gzip
  initial CSS                     35 KiB gzip
  initial HTML + CSS + JavaScript 190 KiB gzip
  one route content chunk         45 KiB gzip
  lazy diagram chunk              90 KiB gzip
  static search metadata          30 KiB gzip
  initial requests                12

The check is intentionally a production-output gate. Build dist/ before running
it; --help is available before the application mount exists.`)
}

function gzipSize(filePath) {
  return gzipSync(fs.readFileSync(filePath), { level: 9 }).byteLength
}

function cleanReference(reference) {
  return reference.split('#', 1)[0].split('?', 1)[0]
}

function isExternalReference(reference) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)
}

function isInsideDirectory(directory, candidate) {
  const relative = path.relative(directory, candidate)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

function assetKind(reference) {
  const clean = cleanReference(reference)
  if (/\.js$/i.test(clean)) return 'JavaScript'
  if (/\.css$/i.test(clean)) return 'CSS'
  return null
}

function assetResolution(distDirectory, reference) {
  const clean = cleanReference(reference)
  if (isExternalReference(clean) || !clean) return null

  const candidates = []
  if (clean.startsWith('/')) {
    const relativeReference = clean.startsWith(VITE_BASE) ? clean.slice(VITE_BASE.length) : clean.slice(1)
    const candidate = path.resolve(distDirectory, relativeReference)
    if (isInsideDirectory(distDirectory, candidate)) candidates.push(candidate)
  } else {
    const candidate = path.resolve(distDirectory, clean)
    if (isInsideDirectory(distDirectory, candidate)) candidates.push(candidate)
  }

  const existing = candidates.filter((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
  return {
    candidates,
    filePath: existing[0] ?? candidates[0] ?? path.resolve(distDirectory, clean),
  }
}

function referencedAssets(distDirectory, indexPath, references) {
  const assets = []
  const errors = []

  for (const reference of references) {
    const kind = assetKind(reference)
    if (!kind || isExternalReference(cleanReference(reference))) continue

    const resolution = assetResolution(distDirectory, reference)
    const filePath = resolution?.filePath
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const lookedIn = resolution?.candidates?.map((candidate) => path.relative(distDirectory, candidate)).join(', ') || '(no in-dist path)'
      errors.push(`missing local ${kind} asset referenced by ${indexPath}: ${reference} (looked under ${lookedIn})`)
      continue
    }
    assets.push({ kind, filePath })
  }

  return { assets, errors }
}

function collectJavaScriptFiles(directory) {
  const files = []
  const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectJavaScriptFiles(filePath))
    } else if (entry.isFile() && /\.js$/i.test(entry.name)) {
      files.push(filePath)
    }
  }
  return files
}

function isDiagramChunk(filePath) {
  const name = path.basename(filePath).toLowerCase()
  if (/diagram|beautiful|dompurify|mermaid/.test(name)) return true
  const source = fs.readFileSync(filePath, 'utf8')
  return /beautiful-mermaid|dompurify/i.test(source)
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp()
    return 0
  }
  const distDirectory = path.resolve(process.argv[2] ?? 'dist')
  const indexPath = path.join(distDirectory, 'index.html')
  if (!fs.existsSync(indexPath)) {
    console.error(`Budget check blocked: ${indexPath} does not exist. Build dist/ first.`)
    return 1
  }

  const html = fs.readFileSync(indexPath, 'utf8')
  const references = [...html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1])
  const referenced = referencedAssets(distDirectory, indexPath, references)
  const errors = [...referenced.errors]
  const initialJavaScript = [...new Set(referenced.assets.filter(({ kind }) => kind === 'JavaScript').map(({ filePath }) => filePath))]
  const initialCss = [...new Set(referenced.assets.filter(({ kind }) => kind === 'CSS').map(({ filePath }) => filePath))]
  const allJavaScript = collectJavaScriptFiles(distDirectory)
  const initialSet = new Set(initialJavaScript)
  if (initialJavaScript.length === 0) {
    errors.push('zero initial JavaScript assets resolved from dist/index.html; the React build must reference an initial JavaScript entry')
  }

  if (errors.length > 0) {
    console.error(`Budget check failed with ${errors.length} error(s):`)
    for (const error of errors) console.error(`- ${error}`)
    return 1
  }

  const initialJsSize = initialJavaScript.reduce((total, filePath) => total + gzipSize(filePath), 0)
  const initialCssSize = initialCss.reduce((total, filePath) => total + gzipSize(filePath), 0)
  const initialTransferSize = gzipSync(Buffer.from(html), { level: 9 }).byteLength + initialJsSize + initialCssSize

  if (initialJsSize > BUDGETS.initialShellJs) errors.push(`initial JavaScript ${formatBytes(initialJsSize)} exceeds 140 KiB`)
  if (initialCssSize > BUDGETS.initialCss) errors.push(`initial CSS ${formatBytes(initialCssSize)} exceeds 35 KiB`)
  if (initialTransferSize > BUDGETS.initialTransfer) errors.push(`initial transfer ${formatBytes(initialTransferSize)} exceeds 190 KiB`)
  if (references.length + 1 > BUDGETS.initialRequests) errors.push(`initial requests ${references.length + 1} exceeds 12`)

  for (const filePath of allJavaScript.filter((candidate) => !initialSet.has(candidate))) {
    const size = gzipSize(filePath)
    if (isDiagramChunk(filePath)) {
      if (size > BUDGETS.diagramChunk) errors.push(`${path.basename(filePath)} ${formatBytes(size)} exceeds 90 KiB diagram budget`)
    } else if (size > BUDGETS.routeChunk) {
      errors.push(`${path.basename(filePath)} ${formatBytes(size)} exceeds 45 KiB route budget`)
    }
    if (/search|registry/i.test(path.basename(filePath)) && size > BUDGETS.searchMetadata) {
      errors.push(`${path.basename(filePath)} ${formatBytes(size)} exceeds 30 KiB search metadata budget`)
    }
  }

  if (errors.length > 0) {
    console.error(`Budget check failed with ${errors.length} error(s):`)
    for (const error of errors) console.error(`- ${error}`)
    return 1
  }
  console.log(`Budget check passed for ${distDirectory}`)
  console.log(`Initial JS ${formatBytes(initialJsSize)}; CSS ${formatBytes(initialCssSize)}; transfer ${formatBytes(initialTransferSize)}; requests ${references.length + 1}`)
  return 0
}

process.exitCode = main()
