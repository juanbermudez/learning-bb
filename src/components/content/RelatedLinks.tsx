import { Link } from 'react-router-dom'
import { pageForId } from '../../content/registry'

export function RelatedLinks({ ids }: { ids: readonly string[] }) {
  const links = ids.slice(0, 3).map((id) => pageForId(id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
  if (!links.length) return null
  return <section className="related-links" aria-labelledby="related-links-title"><h2 id="related-links-title">Keep reading</h2><div className="related-links__list">{links.map(({ meta }) => <Link key={meta.id} to={meta.route}><span>{meta.section === 'blueprints' ? 'Proposed: ' : ''}{meta.navTitle}</span><small aria-hidden="true">→</small></Link>)}</div></section>
}
