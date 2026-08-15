import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
const STORAGE_KEY = 'learning-bb.theme'

interface ThemeContextValue {
  choice: ThemeChoice
  resolvedTheme: 'light' | 'dark'
  setChoice: (choice: ThemeChoice) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // Storage is an enhancement; system preference remains the fallback.
  }
  return 'system'
}

function systemTheme(): 'light' | 'dark' {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => (typeof window === 'undefined' ? 'system' : readChoice()))
  const [system, setSystem] = useState<'light' | 'dark'>(() => (typeof window === 'undefined' ? 'light' : systemTheme()))
  const resolvedTheme = choice === 'system' ? system : choice

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystem(media.matches ? 'dark' : 'light')
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo<ThemeContextValue>(() => ({
    choice,
    resolvedTheme,
    setChoice(next) {
      setChoiceState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Keep the active selection for this session when storage is unavailable.
      }
    },
  }), [choice, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
