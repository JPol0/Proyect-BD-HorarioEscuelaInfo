import { type Materia } from '../../../domain/Materia'
import { type Horario } from '../../../domain/Horario'
import { autoAsignarMateria } from '../../../domain/services/AutoAssignScheduleService'

export class AutoAsignarMateria {
  execute (materia: Materia, horarioActual: Horario[], termId: string, seccion: number = 1): Horario[] {
    return autoAsignarMateria(materia, horarioActual, termId, seccion)
  }
}
