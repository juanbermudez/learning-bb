/**
 * The public content contract shared by every page worker and by the shell.
 * Keep this file dependency-free: content metadata is build input, not UI state.
 */

export const EVIDENCE_LABELS = [
  'observed',
  'inference',
  'proposed',
  'unknown',
] as const

export type EvidenceLabel = (typeof EVIDENCE_LABELS)[number]

export const EVIDENCE_LABEL_TEXT = [
  'Observed',
  'Inference',
  'Proposed',
  'Unknown',
] as const

export type EvidenceLabelText = (typeof EVIDENCE_LABEL_TEXT)[number]
export type EvidenceLabelInput = EvidenceLabel | EvidenceLabelText

export const CONTENT_SECTIONS = [
  'orientation',
  'runtime',
  'interface',
  'plugins',
  'foundations',
  'operations',
  'blueprints',
] as const

export type ContentSection = (typeof CONTENT_SECTIONS)[number]

export interface PageHeading {
  id: string
  title: string
}

export interface PageMeta {
  id: string
  route: string
  section: ContentSection
  navTitle: string
  title: string
  summary: string
  readingOrder: number
  readingMinutes: number
  headings: readonly PageHeading[]
  keywords: readonly string[]
  searchTerms: readonly string[]
  evidenceMix: readonly EvidenceLabel[]
  relatedPageIds: readonly string[]
}

export interface SourceSnapshot {
  branch: string
  commit: string
  dirty: boolean
  observedAt: string
}

export type SourceType =
  | 'bb-source'
  | 'official-external'
  | 'rendered-reference'
  | 'proposal-guide'

export type PublicSourceStatus = 'verified' | 'local-only' | 'unverified'

export interface PublicSourceState {
  status: PublicSourceStatus
  url: string | null
  rawUrl: string | null
  verifiedAt: string | null
}

export interface BbSourceRecord {
  id: string
  type: 'bb-source'
  label: EvidenceLabelText
  statement: string
  snapshot: SourceSnapshot
  path: string
  symbol: string
  lineStart: number
  lineEnd: number
  windowSha256: string
  public: PublicSourceState
}

export interface ExternalSourceRecord {
  id: string
  type: Exclude<SourceType, 'bb-source'>
  label: EvidenceLabelText
  statement: string
  snapshot?: SourceSnapshot
  path?: string
  symbol?: string
  lineStart?: number
  lineEnd?: number
  windowSha256?: string
  public?: PublicSourceState
  url?: string
  retrievedAt?: string
}

export type SourceRecord = BbSourceRecord | ExternalSourceRecord

export interface DiagramDefinition {
  id: string
  title: string
  caption: string
  evidenceMix: readonly EvidenceLabel[]
  sourceIds: readonly string[]
  code: string
  textAlternative: string
}

export function definePageMeta<const T extends PageMeta>(meta: T): Readonly<T> {
  return Object.freeze(meta)
}

export function defineDiagramDefinition<const T extends DiagramDefinition>(
  definition: T,
): Readonly<T> {
  return Object.freeze(definition)
}

export function isEvidenceLabel(value: unknown): value is EvidenceLabel {
  return typeof value === 'string' && EVIDENCE_LABELS.includes(value as EvidenceLabel)
}

export function isEvidenceLabelText(value: unknown): value is EvidenceLabelText {
  return (
    typeof value === 'string' &&
    EVIDENCE_LABEL_TEXT.includes(value as EvidenceLabelText)
  )
}

export function evidenceLabelText(value: EvidenceLabel): EvidenceLabelText {
  return value[0].toUpperCase() + value.slice(1) as EvidenceLabelText
}
