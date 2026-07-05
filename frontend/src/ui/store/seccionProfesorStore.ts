import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SeccionProfesorState {
  // codTerm -> codMateria -> nroSeccion -> cedulaProfesor
  assignments: Record<string, Record<string, Record<number, string>>>
  assignProfesor: (codTerm: string, codMateria: string, seccion: number, cedulaProfesor?: string) => void
  getProfesorForSeccion: (codTerm: string, codMateria: string, seccion: number) => string | undefined
}

export const useSeccionProfesorStore = create<SeccionProfesorState>()(
  persist(
    (set, get) => ({
      assignments: {},
      assignProfesor: (codTerm, codMateria, seccion, cedulaProfesor) => {
        set((state) => {
          const newAssignments = { ...state.assignments }

          if (!newAssignments[codTerm]) {
            newAssignments[codTerm] = {}
          }
          if (!newAssignments[codTerm][codMateria]) {
            newAssignments[codTerm][codMateria] = {}
          }

          if (cedulaProfesor === undefined || cedulaProfesor === 'ninguno') {
            delete newAssignments[codTerm][codMateria][seccion]
          } else {
            newAssignments[codTerm][codMateria][seccion] = cedulaProfesor
          }

          return { assignments: newAssignments }
        })
      },
      getProfesorForSeccion: (codTerm, codMateria, seccion) => {
        return get().assignments[codTerm]?.[codMateria]?.[seccion]
      }
    }),
    {
      name: 'seccion-profesor-assignments'
    }
  )
)
