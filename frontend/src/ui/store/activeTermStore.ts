import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type Term } from '../../core/domain/Term'

interface ActiveTermState {
  activeTerm: Term | null
  setActiveTerm: (term: Term) => void
  clearActiveTerm: () => void
}

const STORAGE_KEY = 'activeTerm'

// Custom storage matching the original localStorage format
const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const raw = localStorage.getItem(name)
    if (raw === null) return null
    try {
      const term = JSON.parse(raw) as Term
      return JSON.stringify({
        state: {
          activeTerm: term
        },
        version: 0
      })
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value) as { state: { activeTerm: Term | null } }
      const term = parsed.state.activeTerm
      if (term === null) {
        localStorage.removeItem(name)
      } else {
        localStorage.setItem(name, JSON.stringify(term))
      }
    } catch {}
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  }
}

const useActiveTermStore = create<ActiveTermState>()(
  persist(
    (set) => ({
      activeTerm: null,
      setActiveTerm: (term) => {
        set({ activeTerm: term })
      },
      clearActiveTerm: () => {
        set({ activeTerm: null })
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => customStorage)
    }
  )
)

export function useActiveTerm () {
  return useActiveTermStore()
}
