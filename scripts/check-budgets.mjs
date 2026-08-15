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

function assetPath(distDirectory, reference) {
  const cleanReference = reference.split('#', 1)[0].split('?', 1)[0]
  return path.join(distDirectory, cleanReference.replace(/^\//, ''))
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
  const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1])
  const initialJavaScript = references
    .filter((reference) => /\.js(?:[?#]|$)/.test(reference))
    .map((reference) => assetPath(distDirectory, reference))
    .filter((filePath) => fs.existsSync(filePath))
  const initialCss = references
    .filter((reference) => /\.css(?:[?#]|$)/.test(reference))
    .map((reference) => assetPath(distDirectory, reference))
    .filter((filePath) => fs.existsSync(filePath))
  const allJavaScript = []
  for (const entry of fs.readdirSync(distDirectory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.js')) allJavaScript.push(path.join(distDirectory, entry.name))
  }
  const initialSet = new Set(initialJavaScript)
  const errors = []
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
