// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import type { PageMeta } from '../content/schema'
import App from './App'
import { DocArticle } from '../components/content/DocArticle'
import { PageSection } from '../components/content/PageSection'
import { ThemeProvider } from '../components/theme/ThemeProvider'

const testRegistry = vi.hoisted(() => ({ entries: [] as Array<{ meta: PageMeta; load: () => Promise<{ default: ComponentType }> }> }))

vi.mock('../content/registry', () => ({
  contentRegistry: testRegistry.entries,
  pageForRoute: (route: string) => testRegistry.entries.find((entry) => entry.meta.route === route),
  pageForId: (id: string) => testRegistry.entries.find((entry) => entry.meta.id === id),
}))

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

const HOME_META: PageMeta = {
  id: 'home',
  route: '/',
  section: 'orientation',
  navTitle: 'Home',
  title: 'What is BB?',
  summary: 'A metadata-derived Home summary.',
  readingOrder: 1,
  readingMinutes: 3,
  headings: [{ id: 'home-heading', title: 'Home heading' }],
  keywords: ['bb'],
  searchTerms: ['start'],
  evidenceMix: ['observed'],
  relatedPageIds: [],
}

const RUNTIME_META: PageMeta = {
  id: 'runtime-runtime-boundaries',
  route: '/runtime/runtime-boundaries',
  section: 'runtime',
  navTitle: 'Runtime boundaries',
  title: 'Server, daemon, and provider',
  summary: 'A metadata-derived Runtime summary.',
  readingOrder: 2,
  readingMinutes: 3,
  headings: [{ id: 'runtime-heading', title: 'Runtime heading' }],
  keywords: ['runtime'],
  searchTerms: ['where work runs'],
  evidenceMix: ['observed'],
  relatedPageIds: [],
}

const UNUSED_META: PageMeta = {
  id: 'interface-shell-and-navigation',
  route: '/interface/shell-and-navigation',
  section: 'interface',
  navTitle: 'App shell',
  title: 'App shell and navigation',
  summary: 'An unselected page fixture.',
  readingOrder: 3,
  readingMinutes: 3,
  headings: [{ id: 'unused-heading', title: 'Unused heading' }],
  keywords: ['shell'],
  searchTerms: ['navigation'],
  evidenceMix: ['observed'],
  relatedPageIds: [],
}

function makePage(meta: PageMeta, body: string): ComponentType {
  return function TestPage() {
    return <DocArticle meta={meta}><PageSection id={meta.headings[0].id} title={meta.headings[0].title}><p>{body}</p></PageSection></DocArticle>
  }
}

const HOME_PAGE = makePage(HOME_META, 'Home page content')
const RUNTIME_PAGE = makePage(RUNTIME_META, 'Runtime page content')

type PageModuleFixture = { default: ComponentType }
type LoaderSpy = Mock<() => Promise<PageModuleFixture>>

let homeLoad: LoaderSpy
let runtimeLoad: LoaderSpy
let unusedLoad: LoaderSpy
let homeDeferred: Deferred<PageModuleFixture>
let runtimeDeferred: Deferred<PageModuleFixture>
let unusedDeferred: Deferred<PageModuleFixture>

function NavigationHarness() {
  const navigate = useNavigate()
  return <><button type="button" data-testid="go-runtime" onClick={() => navigate(RUNTIME_META.route)}>Go to Runtime</button><button type="button" data-testid="go-back" onClick={() => navigate(-1)}>Back</button><button type="button" data-testid="go-forward" onClick={() => navigate(1)}>Forward</button></>
}

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function renderApp(initialRoute: string, includeLocationProbe = false) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider>
        <NavigationHarness />
        {includeLocationProbe ? <LocationProbe /> : null}
        <App />
      </ThemeProvider>
    </MemoryRouter>,
  )
}

function routeHeading() {
  return document.querySelector<HTMLElement>('[data-route-heading]')
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
  document.head.innerHTML = '<meta name="description" content="initial description" />'
  homeDeferred = deferred<PageModuleFixture>()
  runtimeDeferred = deferred<PageModuleFixture>()
  unusedDeferred = deferred<PageModuleFixture>()
  homeLoad = vi.fn<() => Promise<PageModuleFixture>>(() => homeDeferred.promise)
  runtimeLoad = vi.fn<() => Promise<PageModuleFixture>>(() => runtimeDeferred.promise)
  unusedLoad = vi.fn<() => Promise<PageModuleFixture>>(() => unusedDeferred.promise)
  testRegistry.entries.splice(
    0,
    testRegistry.entries.length,
    { meta: HOME_META, load: homeLoad },
    { meta: RUNTIME_META, load: runtimeLoad },
    { meta: UNUSED_META, load: unusedLoad },
  )
})

afterEach(() => {
  cleanup()
})

describe('populated shell integration', () => {
  it('loads the populated Home route and only invokes its loader', async () => {
    renderApp('/')

    expect(screen.getByText('Loading page…')).toBeTruthy()
    expect(homeLoad).toHaveBeenCalledTimes(1)
    expect(runtimeLoad).not.toHaveBeenCalled()
    expect(unusedLoad).not.toHaveBeenCalled()

    await act(async () => homeDeferred.resolve({ default: HOME_PAGE }))

    expect(await screen.findByRole('heading', { name: 'What is BB?' })).toBeTruthy()
    expect(screen.queryByText('Learning BB shell')).toBeNull()
  })

  it('does not focus a pending registered route and focuses its heading after resolution', async () => {
    renderApp(RUNTIME_META.route)

    expect(screen.getByText('Loading page…')).toBeTruthy()
    expect(routeHeading()).toBeNull()
    expect(document.activeElement?.getAttribute('data-route-heading')).not.toBe('true')

    await act(async () => runtimeDeferred.resolve({ default: RUNTIME_PAGE }))

    const heading = await screen.findByRole('heading', { name: RUNTIME_META.title })
    await waitFor(() => expect(document.activeElement).toBe(heading))
  })

  it('remounts loading state on navigation and focuses only the destination heading', async () => {
    renderApp('/')
    await act(async () => homeDeferred.resolve({ default: HOME_PAGE }))
    expect(await screen.findByText('Home page content')).toBeTruthy()

    await act(async () => fireEvent.click(screen.getByTestId('go-runtime')))

    expect(screen.getByText('Loading page…')).toBeTruthy()
    expect(screen.queryByText('Home page content')).toBeNull()
    expect(runtimeLoad).toHaveBeenCalledTimes(1)
    expect(routeHeading()).toBeNull()

    await act(async () => runtimeDeferred.resolve({ default: RUNTIME_PAGE }))

    const heading = await screen.findByRole('heading', { name: RUNTIME_META.title })
    await waitFor(() => expect(document.activeElement).toBe(heading))
  })

  it('renders no breadcrumb on Home', async () => {
    renderApp('/')
    await act(async () => homeDeferred.resolve({ default: HOME_PAGE }))

    await screen.findByRole('heading', { name: HOME_META.title })
    expect(document.querySelector('nav[aria-label="Breadcrumb"]')).toBeNull()
  })

  it('derives the Runtime section breadcrumb from metadata', async () => {
    renderApp(RUNTIME_META.route)
    await act(async () => runtimeDeferred.resolve({ default: RUNTIME_PAGE }))

    await screen.findByRole('heading', { name: RUNTIME_META.title })
    const breadcrumb = document.querySelector<HTMLElement>('nav[aria-label="Breadcrumb"]')
    expect(breadcrumb?.textContent).toContain('Runtime')
    expect(breadcrumb?.textContent).toContain('Runtime boundaries')
    expect(breadcrumb?.textContent).not.toContain('Documentation')
    expect(breadcrumb?.querySelector('a')?.getAttribute('href')).toBe('/runtime/send-queue-start')
    expect(breadcrumb?.querySelector('[aria-current="page"]')?.textContent).toBe('Runtime boundaries')
  })

  it('keeps unknown routes in the shell and focuses Page not found', async () => {
    renderApp('/not-a-learning-bb-route')

    const heading = screen.getByRole('heading', { name: 'Page not found' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.getByText('/not-a-learning-bb-route')).toBeTruthy()
  })

  it('keeps document title and description metadata-derived', async () => {
    renderApp(RUNTIME_META.route)

    expect(document.title).toBe('Server, daemon, and provider · Learning BB')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(RUNTIME_META.summary)
  })

  it('does not invoke an unselected route loader', () => {
    renderApp(RUNTIME_META.route)

    expect(runtimeLoad).toHaveBeenCalledTimes(1)
    expect(homeLoad).not.toHaveBeenCalled()
    expect(unusedLoad).not.toHaveBeenCalled()
  })
})

describe('heading deep links', () => {
  it('focuses a valid metadata heading after a direct lazy load without rendering Not Found', async () => {
    renderApp(`${RUNTIME_META.route}?heading=runtime-heading`, true)
    await act(async () => runtimeDeferred.resolve({ default: RUNTIME_PAGE }))

    const heading = await screen.findByRole('heading', { level: 2, name: 'Runtime heading' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(heading.getAttribute('tabindex')).toBe('-1')
    expect(screen.getByTestId('location').textContent).toBe(`${RUNTIME_META.route}?heading=runtime-heading`)
    expect(screen.queryByRole('heading', { name: 'Page not found' })).toBeNull()
  })

  it('uses canonical encoded query targets and keeps the lazy page mounted through history', async () => {
    renderApp(RUNTIME_META.route)
    await act(async () => runtimeDeferred.resolve({ default: RUNTIME_PAGE }))

    const routeHeading = await screen.findByRole('heading', { level: 1, name: RUNTIME_META.title })
    const inlineLink = screen.getByRole('link', { name: 'Link to Runtime heading' })
    const outlineLink = screen.getByRole('link', { name: 'Runtime heading' })
    expect(inlineLink.getAttribute('href')).toBe(`${RUNTIME_META.route}?heading=runtime-heading`)
    expect(outlineLink.getAttribute('href')).toBe(`${RUNTIME_META.route}?heading=runtime-heading`)

    fireEvent.click(inlineLink)
    const sectionHeading = screen.getByRole('heading', { level: 2, name: 'Runtime heading' })
    await waitFor(() => expect(document.activeElement).toBe(sectionHeading))
    expect(runtimeLoad).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('go-back'))
    await waitFor(() => expect(document.activeElement).toBe(routeHeading))
    expect(sectionHeading.getAttribute('tabindex')).toBeNull()
    fireEvent.click(screen.getByTestId('go-forward'))
    await waitFor(() => expect(document.activeElement).toBe(sectionHeading))
    expect(runtimeLoad).toHaveBeenCalledTimes(1)
  })

  it('leaves route H1 focus unchanged for an invalid heading query', async () => {
    renderApp(`${RUNTIME_META.route}?heading=not-in-current-metadata`)
    await act(async () => runtimeDeferred.resolve({ default: RUNTIME_PAGE }))

    const heading = await screen.findByRole('heading', { level: 1, name: RUNTIME_META.title })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.queryByRole('heading', { name: 'Page not found' })).toBeNull()
  })
})

it('renders the Home Orientation rail with all three canonical pages and Home current', async () => {
  const systemMeta: PageMeta = { ...HOME_META, id: 'orientation-system-map', route: '/orientation/system-map', navTitle: 'System map', title: 'The whole BB system', readingOrder: 2 }
  const sourceMeta: PageMeta = { ...HOME_META, id: 'orientation-source-and-fork', route: '/orientation/source-and-fork', navTitle: 'Source snapshot', title: 'Source snapshot and maintained fork', readingOrder: 3 }
  testRegistry.entries.splice(1, 0,
    { meta: systemMeta, load: vi.fn(async () => ({ default: HOME_PAGE })) },
    { meta: sourceMeta, load: vi.fn(async () => ({ default: HOME_PAGE })) },
  )

  renderApp('/')
  await act(async () => homeDeferred.resolve({ default: HOME_PAGE }))
  await screen.findByRole('heading', { level: 1, name: HOME_META.title })

  const rail = document.querySelector<HTMLElement>('.page-rail')
  expect(rail?.querySelector('.page-rail__title')?.textContent).toBe('Orientation')
  expect(Array.from(rail?.querySelectorAll('.page-rail__list a') ?? []).map((link) => link.textContent)).toEqual(['Home', 'System map', 'Source snapshot'])
  expect(rail?.querySelector('a[href="/"]')?.getAttribute('aria-current')).toBe('page')
})

it('exposes the required document landmarks without changing shell order', async () => {
  renderApp('/')
  await act(async () => homeDeferred.resolve({ default: HOME_PAGE }))
  await screen.findByRole('heading', { level: 1, name: HOME_META.title })

  expect(document.querySelector('header.section-rail nav[aria-label="Documentation sections"]')).toBeTruthy()
  expect(document.querySelector('header.topbar')).toBeTruthy()
  const contentinfo = screen.getByRole('contentinfo')
  expect(contentinfo.querySelector('nav[aria-label="Page navigation"]')).toBeTruthy()
  expect(screen.getByRole('main')).toBeTruthy()
  expect(screen.getByRole('article')).toBeTruthy()
})
