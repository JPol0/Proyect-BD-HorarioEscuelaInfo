import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type User } from '../../core/domain/User'

interface UserState {
  currentUser: User | null
  setCurrentUser: (user: User) => void
  clearCurrentUser: () => void
}

const STORAGE_KEY = 'currentUser'

// Custom storage matching local storage structure
const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const raw = localStorage.getItem(name)
    if (raw === null) return null
    try {
      const user = JSON.parse(raw) as User
      return JSON.stringify({
        state: {
          currentUser: user
        },
        version: 0
      })
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value) as { state: { currentUser: User | null } }
      const user = parsed.state.currentUser
      if (user === null) {
        localStorage.removeItem(name)
      } else {
        localStorage.setItem(name, JSON.stringify(user))
      }
    } catch {}
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  }
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => {
        set({ currentUser: user })
      },
      clearCurrentUser: () => {
        set({ currentUser: null })
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => customStorage)
    }
  )
)

export function useUser () {
  return useUserStore()
}
