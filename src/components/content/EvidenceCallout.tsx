import type { EvidenceLabel, EvidenceLabelInput } from '../../content/schema'
import { EvidenceBadge } from './EvidenceBadge'

interface Props {
  kind: EvidenceLabelInput
  claim: string
  explanation?: string
  sourceIds?: readonly string[]
  basedOn?: readonly string[]
}

function normalized(label: EvidenceLabelInput): EvidenceLabel { return label.toLocaleLowerCase() as EvidenceLabel }

export function EvidenceCallout({ kind, claim, explanation, sourceIds = [], basedOn = [] }: Props) {
  const label = normalized(kind)
  return <aside className={`evidence-callout evidence-callout--${label}`}><div className="evidence-callout__heading"><EvidenceBadge label={label} /></div><p className="evidence-callout__claim">{claim}</p>{explanation && <p>{explanation}</p>}{(sourceIds.length > 0 || basedOn.length > 0) && <div className="evidence-callout__sources"><span>{basedOn.length ? `Based on: ${basedOn.join(', ')}` : `Sources: ${sourceIds.join(', ')}`}</span></div>}</aside>
}
