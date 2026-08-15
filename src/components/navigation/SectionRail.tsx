import { Link } from 'react-router-dom'
import { SECTION_DEFINITIONS, type SectionDefinition, SNAPSHOT_LABEL } from '../../app/navigation'
import { ThemeControl } from '../theme/ThemeControl'
import { RailIcon, SearchIcon } from './icons'

export function SectionRail({ activeSection, onSearch }: { activeSection?: SectionDefinition; onSearch: () => void }) {
  return (
    <header className="section-rail">
      <Link to="/" className="brand-mark" aria-label="Learning BB home" title="Learning BB">L·B</Link>
      <nav className="section-rail__links" aria-label="Documentation sections">
        <button type="button" className="rail-link" onClick={onSearch} aria-label="Search documentation" title="Search (Ctrl+K)">
          <span className="rail-link__icon"><SearchIcon /></span><span>Search</span>
        </button>
        {SECTION_DEFINITIONS.map((section) => (
          <Link
            key={section.id}
            to={section.firstRoute}
            className="rail-link"
            aria-current={activeSection?.id === section.id ? 'true' : undefined}
            title={section.label}
          >
            <span className="rail-link__icon"><RailIcon kind={section.id} /></span>
            <span>{section.shortLabel}</span>
          </Link>
        ))}
      </nav>
      <div className="section-rail__bottom">
        <ThemeControl compact />
        <span className="snapshot-dot" title={SNAPSHOT_LABEL}>Snapshot</span>
      </div>
    </header>
  )
}
