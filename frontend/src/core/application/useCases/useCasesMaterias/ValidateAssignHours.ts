import { type Materia } from '../../../domain/Materia'
import { puedeAsignarHoras } from '../../../domain/services/MateriaServices'

export class ValidateAssignHours {
  execute (materia: Materia): void {
    if (!puedeAsignarHoras(materia)) {
      throw new Error('La materia no tiene horas teóricas ni de laboratorio cargadas. Por favor, asigne horas en "Consultar" antes de enviarla al horario.')
    }
  }
}
