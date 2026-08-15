import { Link } from 'react-router-dom'
import type { PageMeta } from '../../content/schema'

export function FooterNavigation({ previous, next }: { previous?: PageMeta; next?: PageMeta }) {
  if (!previous && !next) return null
  return (
    <footer role="contentinfo">
      <nav className="footer-nav" aria-label="Page navigation">
        {previous ? <Link className="footer-nav__card" to={previous.route}><span className="footer-nav__label">Previous</span><span className="footer-nav__title">{previous.navTitle}</span></Link> : <span />}
        {next ? <Link className="footer-nav__card footer-nav__card--next" to={next.route}><span className="footer-nav__label">Next</span><span className="footer-nav__title">{next.navTitle}</span></Link> : <span />}
      </nav>
    </footer>
  )
}
