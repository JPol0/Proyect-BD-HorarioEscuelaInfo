import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LabAssignment {
  principal: number
  secundario?: number
}

interface MateriaLabState {
  assignments: Record<string, Record<string, LabAssignment>> // codTerm -> codMateria -> LabAssignment
  assignLab: (codTerm: string, codMateria: string, asignacion?: LabAssignment) => void
  getLabForMateria: (codTerm: string, codMateria: string) => LabAssignment | undefined
}

export const useMateriaLabStore = create<MateriaLabState>()(
  persist(
    (set, get) => ({
      assignments: {},
      assignLab: (codTerm, codMateria, asignacion) => {
        set((state) => {
          const newAssignments = { ...state.assignments }

          if (!newAssignments[codTerm]) {
            newAssignments[codTerm] = {}
          }

          if (!asignacion?.principal || asignacion.principal === 0) {
            const newTermAssignments = { ...newAssignments[codTerm] }
            delete newTermAssignments[codMateria]
            newAssignments[codTerm] = newTermAssignments
          } else {
            newAssignments[codTerm] = {
              ...newAssignments[codTerm],
              [codMateria]: asignacion
            }
          }

          return { assignments: newAssignments }
        })
      },
      getLabForMateria: (codTerm, codMateria) => {
        return get().assignments[codTerm]?.[codMateria]
      }
    }),
    {
      name: 'materia-laboratorio-assignments-v5'
    }
  )
)
