#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PAGE_INVENTORY,
  PROJECT_ROOT,
  contentTriplets,
  failWith,
  parsePage,
  scanForbiddenText,
  walkFiles,
} from './audit-helpers.mjs'

const REMOTE_ASSET_PATTERN = /(?:@import\s+(?:url\()?|(?:src|href)=['"]|url\()\s*['"]?https?:\/\//i
const COPIED_ASSET_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.webp', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.mov'])

export function auditStaticLinks(projectRoot = PROJECT_ROOT) {
  const errors = []
  const routes = new Set(PAGE_INVENTORY.map((page) => page.route))
  let internalLinks = 0
  let headingLinks = 0

  for (const triplet of contentTriplets(projectRoot)) {
    if (!fs.existsSync(triplet.pagePath)) continue
    const page = parsePage(triplet.pagePath)
    for (const link of page.links) {
      if (link.kind === 'route') {
        internalLinks += 1
        const [route, fragment] = link.value.split('#')
        if (!routes.has(route)) errors.push(`${triplet.stem}: broken internal route ${link.value}`)
        if (fragment && route === triplet.expected.route && !page.headings.includes(fragment)) errors.push(`${triplet.stem}: broken route heading ${link.value}`)
      } else if (link.value.startsWith('#')) {
        headingLinks += 1
        const fragment = link.value.slice(1)
        if (!page.headings.includes(fragment)) errors.push(`${triplet.stem}: broken local heading #${fragment}`)
      } else if (/^(?:javascript|vbscript|data:text\/html|file):/i.test(link.value)) errors.push(`${triplet.stem}: unsafe link scheme ${link.value}`)
    }
  }

  const sourceMapPath = path.join(projectRoot, 'public', 'source-map.json')
  let sourceMapRows = 0
  if (!fs.existsSync(sourceMapPath)) errors.push('public/source-map.json is missing')
  else {
    let ledger
    try { ledger = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8')) } catch (cause) {
      errors.push(`public/source-map.json is invalid JSON (${cause instanceof Error ? cause.message : String(cause)})`)
      ledger = {}
    }
    sourceMapRows = Object.keys(ledger).length
    if (sourceMapRows !== 344) errors.push('public/source-map.json must contain 344 page-scoped records')
    for (const [key, entry] of Object.entries(ledger)) {
      if (entry.status === 'verified') {
        if (!entry.publicUrl || !entry.verifiedAt || !entry.windowSha256) errors.push(`${key}: verified source-map row is incomplete`)
      } else if (entry.status === 'local-only') {
        if (entry.publicUrl !== null || entry.verifiedAt !== null) errors.push(`${key}: local-only source-map row must not expose a public link`)
      } else errors.push(`${key}: invalid source-map status`)
    }
  }

  const scanRoots = ['src', 'public'].flatMap((relative) => walkFiles(path.join(projectRoot, relative)))
  const scanFiles = [path.join(projectRoot, 'index.html'), path.join(projectRoot, 'README.md'), path.join(projectRoot, 'NOTICE.md'), ...scanRoots]
    .filter((filePath) => fs.existsSync(filePath) && !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(filePath) && !filePath.includes(`${path.sep}generated${path.sep}`) && !filePath.includes(`${path.sep}diagrams${path.sep}`))
  for (const filePath of scanFiles) {
    const relative = path.relative(projectRoot, filePath)
    const text = fs.readFileSync(filePath, 'utf8')
    const forbiddenFindings = scanForbiddenText(text, relative)
    // The shared sanitizer's denylist names executable schemes so it can reject
    // them; the literals are guards, not links or requests.
    errors.push(...forbiddenFindings.filter((finding) => !(relative.endsWith('diagramSanitizer.mjs') && finding.endsWith('unsafe executable URL scheme'))))
    if (REMOTE_ASSET_PATTERN.test(text)) errors.push(`${relative}: remote font or asset request is forbidden`)
    if (COPIED_ASSET_EXTENSIONS.has(path.extname(filePath).toLocaleLowerCase())) errors.push(`${relative}: copied binary/media asset is forbidden`)
  }
  const notice = fs.readFileSync(path.join(projectRoot, 'NOTICE.md'), 'utf8')
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8')
  if (!/independent|unofficial/i.test(notice)) errors.push('NOTICE.md must identify the site as independent/unofficial')
  if (!/beautiful-mermaid/i.test(notice) || !/MIT/i.test(notice)) errors.push('NOTICE.md must attribute Beautiful Mermaid and its MIT license')
  if (!/source-snapshot|local-only|public source/i.test(readme)) errors.push('README.md must document the source snapshot/public-link boundary')

  const distIndex = path.join(projectRoot, 'dist', 'index.html')
  let distAssets = 0
  if (fs.existsSync(distIndex)) {
    const html = fs.readFileSync(distIndex, 'utf8')
    if (REMOTE_ASSET_PATTERN.test(html)) errors.push('dist/index.html: unexpected production network request')
    for (const cssPath of walkFiles(path.join(projectRoot, 'dist', 'assets')).filter((filePath) => filePath.endsWith('.css'))) {
      if (REMOTE_ASSET_PATTERN.test(fs.readFileSync(cssPath, 'utf8'))) errors.push(`${path.relative(projectRoot, cssPath)}: unexpected remote CSS asset`)
    }
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const target = match[1]
      if (/^(?:https?:|data:|javascript:|file:)/i.test(target)) {
        errors.push(`dist/index.html: unexpected external or unsafe asset ${target}`)
        continue
      }
      const baseRelative = target.replace(/^\/learning-bb\//, '').replace(/^\.\//, '')
      if (!baseRelative || baseRelative.startsWith('#')) continue
      distAssets += 1
      if (!fs.existsSync(path.join(projectRoot, 'dist', baseRelative))) errors.push(`dist/index.html: missing static asset ${target}`)
    }
  }
  return { errors, routes: routes.size, internalLinks, headingLinks, sourceMapRows, distAssets }
}

export function main() {
  const result = auditStaticLinks()
  if (result.errors.length) return failWith(result.errors, 'Static link and path audit failed')
  console.log(`Static audit passed: ${result.routes} routes, ${result.internalLinks} authored route links, ${result.headingLinks} authored heading links, ${result.sourceMapRows} source-map rows, ${result.distAssets} built index assets checked.`)
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
