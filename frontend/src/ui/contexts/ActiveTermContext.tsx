import { createContext, useContext, useState, type ReactNode } from 'react'
import { type Term } from '../../core/domain/Term'

// ─── Tipos del Contexto ─────────────────────────────────────────────────────

interface ActiveTermContextValue {
  activeTerm: Term | null
  setActiveTerm: (term: Term) => void
  clearActiveTerm: () => void
}

// ─── Creación del Contexto ───────────────────────────────────────────────────

const ActiveTermContext = createContext<ActiveTermContextValue | null>(null)

// ─── Helpers de persistencia ─────────────────────────────────────────────────

const STORAGE_KEY = 'activeTerm'

function loadFromStorage (): Term | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    return JSON.parse(raw) as Term
  } catch {
    return null
  }
}

function saveToStorage (term: Term): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(term))
}

function clearStorage (): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ActiveTermProviderProps {
  children: ReactNode
}

export function ActiveTermProvider ({ children }: ActiveTermProviderProps) {
  const [activeTerm, setActiveTermState] = useState<Term | null>(loadFromStorage)

  const setActiveTerm = (term: Term): void => {
    saveToStorage(term)
    setActiveTermState(term)
  }

  const clearActiveTerm = (): void => {
    clearStorage()
    setActiveTermState(null)
  }

  return (
    <ActiveTermContext.Provider value={{ activeTerm, setActiveTerm, clearActiveTerm }}>
      {children}
    </ActiveTermContext.Provider>
  )
}

// ─── Hook de consumo ─────────────────────────────────────────────────────────

export function useActiveTerm (): ActiveTermContextValue {
  const ctx = useContext(ActiveTermContext)
  if (ctx === null) {
    throw new Error('useActiveTerm debe usarse dentro de <ActiveTermProvider>')
  }
  return ctx
}
