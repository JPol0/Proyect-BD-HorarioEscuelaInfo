import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SeccionProfesorState {
  // codTerm -> codMateria -> nroSeccion -> cedulaProfesor
  assignments: Record<string, Record<string, Record<number, string>>>
  assignmentsLab: Record<string, Record<string, Record<number, string>>>
  assignProfesor: (codTerm: string, codMateria: string, seccion: number, cedulaProfesor?: string) => void
  assignProfesorLab: (codTerm: string, codMateria: string, seccion: number, cedulaProfesor?: string) => void
  getProfesorForSeccion: (codTerm: string, codMateria: string, seccion: number) => string | undefined
  getProfesorLabForSeccion: (codTerm: string, codMateria: string, seccion: number) => string | undefined
}

export const useSeccionProfesorStore = create<SeccionProfesorState>()(
  persist(
    (set, get) => ({
      assignments: {},
      assignmentsLab: {},
      assignProfesor: (codTerm, codMateria, seccion, cedulaProfesor) => {
        set((state) => {
          const newAssignments = { ...state.assignments }
          const termAssignments = { ...(newAssignments[codTerm] || {}) }
          const materiaAssignments = { ...(termAssignments[codMateria] || {}) }

          if (cedulaProfesor === undefined || cedulaProfesor === 'ninguno') {
            delete materiaAssignments[seccion]
          } else {
            materiaAssignments[seccion] = cedulaProfesor
          }

          termAssignments[codMateria] = materiaAssignments
          newAssignments[codTerm] = termAssignments

          return { assignments: newAssignments }
        })
      },
      assignProfesorLab: (codTerm, codMateria, seccion, cedulaProfesor) => {
        set((state) => {
          const newAssignmentsLab = { ...(state.assignmentsLab || {}) }
          const termAssignments = { ...(newAssignmentsLab[codTerm] || {}) }
          const materiaAssignments = { ...(termAssignments[codMateria] || {}) }

          if (cedulaProfesor === undefined || cedulaProfesor === 'ninguno') {
            delete materiaAssignments[seccion]
          } else {
            materiaAssignments[seccion] = cedulaProfesor
          }

          termAssignments[codMateria] = materiaAssignments
          newAssignmentsLab[codTerm] = termAssignments

          return { assignmentsLab: newAssignmentsLab }
        })
      },
      getProfesorForSeccion: (codTerm, codMateria, seccion) => {
        return get().assignments[codTerm]?.[codMateria]?.[seccion]
      },
      getProfesorLabForSeccion: (codTerm, codMateria, seccion) => {
        return get().assignmentsLab?.[codTerm]?.[codMateria]?.[seccion]
      }
    }),
    {
      name: 'seccion-profesor-assignments'
    }
  )
)
