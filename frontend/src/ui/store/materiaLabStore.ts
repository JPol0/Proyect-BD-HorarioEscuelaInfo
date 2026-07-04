import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MateriaLabState {
  assignments: Record<string, string> // codMateria -> laboratorioId
  assignLab: (codMateria: string, laboratorioId?: string) => void
  getLabForMateria: (codMateria: string) => string | undefined
}

export const useMateriaLabStore = create<MateriaLabState>()(
  persist(
    (set, get) => ({
      assignments: {},
      assignLab: (codMateria, laboratorioId) => {
        set((state) => {
          const newAssignments = { ...state.assignments }
          if (laboratorioId === undefined || laboratorioId === 'ninguno') {
            delete newAssignments[codMateria]
          } else {
            newAssignments[codMateria] = laboratorioId
          }
          return { assignments: newAssignments }
        })
      },
      getLabForMateria: (codMateria) => {
        return get().assignments[codMateria]
      }
    }),
    {
      name: 'materia-laboratorio-assignments'
    }
  )
)
