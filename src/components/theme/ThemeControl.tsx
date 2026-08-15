import { useEffect, useRef, useState } from 'react'
import { useTheme, type ThemeChoice } from './ThemeProvider'

const choices: readonly { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function ThemeControl({ compact = false }: { compact?: boolean }) {
  const { choice, setChoice } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const label = choices.find((item) => item.value === choice)?.label ?? 'System'
  return (
    <div ref={ref} className="theme-control">
      <button
        type="button"
        className="theme-control__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${label}`}
        title={`Theme: ${label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{choice === 'dark' ? '◐' : choice === 'light' ? '○' : '◌'}</span>
        {!compact && <span>{label}</span>}
      </button>
      {open && (
        <div className="theme-control__menu" role="menu" aria-label="Theme">
          {choices.map((item) => (
            <button
              key={item.value}
              type="button"
              role="menuitemradio"
              aria-checked={choice === item.value}
              onClick={() => {
                setChoice(item.value)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
