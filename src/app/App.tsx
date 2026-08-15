import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ComponentType } from 'react'
import type { PageMeta } from '../content/schema'
import { contentRegistry, pageForRoute, type PageModule } from '../content/registry'
import { navigationNeighbors, pagesForSection, sectionForPath, SECTION_DEFINITIONS } from './navigation'
import { MobileNavDialog } from '../components/navigation/MobileNavDialog'
import { PageRail } from '../components/navigation/PageRail'
import { SectionRail } from '../components/navigation/SectionRail'
import { FooterNavigation } from '../components/navigation/FooterNavigation'
import { MenuIcon, SearchIcon } from '../components/navigation/icons'
import { SearchDialog } from '../components/search/SearchDialog'
import { ThemeControl } from '../components/theme/ThemeControl'
import { RelatedLinks } from '../components/content/RelatedLinks'
import B02Gallery from './B02Gallery'

function EmptyRegistryState() {
  return <section className="empty-registry home-orientation-frame" aria-labelledby="registry-state-title"><div className="empty-registry__mark" aria-hidden="true">L·B</div><h1 id="registry-state-title" data-route-heading tabIndex={-1}>Learning BB shell</h1><p>The shared documentation surface is ready. Authored page triplets will populate this route through the typed content registry.</p><div className="route-error__actions"><Link className="button button--primary" to="/orientation/system-map">Open orientation</Link><button type="button" className="button" data-open-search>Search when pages land</button></div></section>
}

function NotFoundState({ pathname }: { pathname: string }) {
  return <section className="route-error" aria-labelledby="not-found-title"><h1 id="not-found-title" data-route-heading tabIndex={-1}>Page not found</h1><p>No authored page is registered for <code>{pathname}</code>.</p><div className="route-error__actions"><Link className="button button--primary" to="/">Home</Link><Link className="button" to="/orientation/system-map">System map</Link><button type="button" className="button" data-open-search>Search</button></div></section>
}

function PageLoader({ meta, load }: { meta: PageMeta; load: () => Promise<PageModule> }) {
  const [Page, setPage] = useState<ComponentType | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let cancelled = false
    load().then((module) => { if (!cancelled) setPage(() => module.default) }).catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [load])
  useEffect(() => {
    if (!Page && !error) return
    document.querySelector<HTMLElement>('[data-route-heading]')?.focus()
  }, [Page, error])
  if (error) return <section className="route-error" aria-labelledby="page-error-title"><h1 id="page-error-title" data-route-heading tabIndex={-1}>Unable to load {meta.title}</h1><p>The route is registered, but its page module failed to load. Return home or try again.</p><div className="route-error__actions"><Link className="button button--primary" to="/">Home</Link></div></section>
  if (!Page) return <div className="empty-registry" aria-live="polite"><strong>Loading page…</strong></div>
  return <Page />
}

function Topbar({ title, onMenu, onSearch }: { title: string; onMenu: () => void; onSearch: () => void }) {
  return <header className="topbar"><button type="button" className="menu-button" aria-label="Open navigation" onClick={onMenu}><MenuIcon /></button><div className="topbar__title">{title}</div><div className="topbar__actions"><button type="button" className="search-trigger" aria-label="Search documentation" title="Search (Ctrl+K)" onClick={onSearch}><SearchIcon /></button><ThemeControl compact /></div></header>
}

export default function App() {
  const location = useLocation()
  const pathname = location.pathname || '/'
  // The gallery is a local component fixture only; it must not become a public route.
  const isGallery = import.meta.env.DEV && pathname === '/_b02/gallery'
  const entry = pageForRoute(pathname)
  const meta = entry?.meta
  const activeSection = sectionForPath(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [routeKey, setRouteKey] = useState(pathname)
  const allPages = useMemo(() => contentRegistry.map((item) => item.meta), [])
  const pagesBySection = useMemo(() => new Map(SECTION_DEFINITIONS.map((section) => [section.id, pagesForSection(section.id)])), [])
  const neighbors = meta ? navigationNeighbors(meta) : { previous: undefined, next: undefined }

  useEffect(() => {
    setRouteKey(pathname)
    setMenuOpen(false)
    setSearchOpen(false)
    const currentTitle = meta?.title ?? (isGallery ? 'Component state gallery' : pathname === '/' && contentRegistry.length === 0 ? 'Learning BB shell' : 'Page not found')
    document.title = `${currentTitle} · Learning BB`
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = meta?.summary ?? 'An independent, source-grounded Learning BB documentation shell.'
    if (!meta || !entry) document.querySelector<HTMLElement>('[data-route-heading]')?.focus()
  }, [meta, pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const editable = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      if ((event.key.toLocaleLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !editable)) {
        event.preventDefault(); setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onOpenSearch = (event: Event) => { if ((event.target as HTMLElement).dataset.openSearch !== undefined) setSearchOpen(true) }
    document.addEventListener('click', onOpenSearch)
    return () => document.removeEventListener('click', onOpenSearch)
  }, [])

  const title = meta?.navTitle ?? activeSection?.label ?? (isGallery ? 'B02 gallery' : pathname === '/' && contentRegistry.length === 0 ? 'Learning BB' : 'Not found')
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SectionRail activeSection={activeSection} onSearch={() => setSearchOpen(true)} />
      <PageRail section={activeSection} pages={activeSection ? pagesBySection.get(activeSection.id) ?? [] : []} activeRoute={pathname} />
      <div className="route-shell__content">
        <Topbar title={title} onMenu={() => setMenuOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main id="main-content" className="page-main" data-route-enter={routeKey === pathname ? 'true' : 'false'}>
          <div className="page-layout">
            <div className="page-layout__reading page-column">
              {isGallery ? <B02Gallery /> : meta && entry ? <PageLoader key={meta.id} meta={meta} load={entry.load} /> : pathname === '/' && contentRegistry.length === 0 ? <EmptyRegistryState /> : <NotFoundState pathname={pathname} />}
              {meta && <><RelatedLinks ids={meta.relatedPageIds} /><FooterNavigation previous={neighbors.previous} next={neighbors.next} /></>}
            </div>
            {meta && <aside className="page-layout__outline"><div className="page-outline" aria-label="On this page"><div className="page-outline__title">On this page</div><div className="page-outline__links">{meta.headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.title}</a>)}</div></div></aside>}
          </div>
        </main>
      </div>
      <MobileNavDialog open={menuOpen} onClose={() => setMenuOpen(false)} activeSection={activeSection} pagesBySection={pagesBySection} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} pages={allPages} />
    </div>
  )
}
