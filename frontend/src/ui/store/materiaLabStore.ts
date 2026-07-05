import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MateriaLabState {
  assignments: Record<string, Record<string, Record<number, string>>> // codTerm -> codMateria -> nroSeccion -> laboratorioId
  assignLab: (codTerm: string, codMateria: string, nroSeccion: number, laboratorioId?: string) => void
  getLabForSeccion: (codTerm: string, codMateria: string, nroSeccion: number) => string | undefined
}

export const useMateriaLabStore = create<MateriaLabState>()(
  persist(
    (set, get) => ({
      assignments: {},
      assignLab: (codTerm, codMateria, nroSeccion, laboratorioId) => {
        set((state) => {
          const newAssignments = { ...state.assignments }

          if (!newAssignments[codTerm]) {
            newAssignments[codTerm] = {}
          }
          if (!newAssignments[codTerm][codMateria]) {
            newAssignments[codTerm][codMateria] = {}
          }

          if (laboratorioId === undefined || laboratorioId === 'ninguno') {
            const materiaSections = newAssignments[codTerm][codMateria]
            if (materiaSections) {
              const newMateriaSections = { ...materiaSections }
              delete newMateriaSections[nroSeccion]
              newAssignments[codTerm][codMateria] = newMateriaSections
            }
          } else {
            newAssignments[codTerm][codMateria] = {
              ...newAssignments[codTerm][codMateria],
              [nroSeccion]: laboratorioId
            }
          }

          return { assignments: newAssignments }
        })
      },
      getLabForSeccion: (codTerm, codMateria, nroSeccion) => {
        return get().assignments[codTerm]?.[codMateria]?.[nroSeccion]
      }
    }),
    {
      name: 'materia-laboratorio-assignments-v2'
    }
  )
)
