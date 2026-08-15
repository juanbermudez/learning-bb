import type { EvidenceLabel, EvidenceLabelInput } from '../../content/schema'

function normalize(label: EvidenceLabelInput): EvidenceLabel {
  return label.toLocaleLowerCase() as EvidenceLabel
}

export function EvidenceBadge({ label }: { label: EvidenceLabelInput }) {
  const normalized = normalize(label)
  const text = normalized[0].toUpperCase() + normalized.slice(1)
  return <span className={`evidence-badge evidence-badge--${normalized}`}>{text}</span>
}
