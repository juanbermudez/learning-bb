// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { PageMeta } from '../../content/schema'
import { SearchDialog } from './SearchDialog'

const PAGE: PageMeta = {
  id: 'runtime-runtime-boundaries',
  route: '/runtime/runtime-boundaries',
  section: 'runtime',
  navTitle: 'Runtime boundaries',
  title: 'Server, daemon, and provider',
  summary: 'A source-grounded runtime boundary summary.',
  readingOrder: 6,
  readingMinutes: 3,
  headings: [{ id: 'owners', title: 'Four owners' }],
  keywords: ['runtime'],
  searchTerms: ['where work runs', 'daemon', 'provider'],
  evidenceMix: ['observed'],
  relatedPageIds: [],
}

function Harness() {
  const [open, setOpen] = useState(false)
  return <><button type="button" onClick={() => setOpen(true)}>Open Search</button><SearchDialog open={open} onClose={() => setOpen(false)} pages={[PAGE]} /></>
}

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute('open', '') },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    },
  })
})

afterEach(() => cleanup())

it('one Escape closes a queried Search dialog, returns exact trigger focus, and reopens empty', async () => {
  render(<MemoryRouter><Harness /></MemoryRouter>)
  const trigger = screen.getByRole('button', { name: 'Open Search' })
  trigger.focus()
  fireEvent.click(trigger)

  const input = screen.getByRole('combobox', { name: 'Search documentation' }) as HTMLInputElement
  await waitFor(() => expect(document.activeElement).toBe(input))
  fireEvent.change(input, { target: { value: 'zzz-no-such-page' } })
  expect(input.value).toBe('zzz-no-such-page')
  expect(screen.getByText(/No page matches/)).toBeTruthy()

  fireEvent.keyDown(input, { key: 'Escape' })
  await waitFor(() => expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(false))
  await waitFor(() => expect(document.activeElement).toBe(trigger))

  fireEvent.click(trigger)
  await waitFor(() => expect(input.value).toBe(''))
  expect(document.activeElement).toBe(input)
})
