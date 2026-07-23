import { type Materia } from '../../../domain/Materia'
import { type Horario } from '../../../domain/Horario'
import { autoAsignarMateria } from '../../../domain/services/AutoAssignScheduleService'
import { type DisponibilidadHoraria } from '../../../domain/DisponibilidadHoraria'

export interface ObtenerDisponibilidadPort {
  obtenerPorProfesorYTerm: (cedula: string, termId: string) => Promise<DisponibilidadHoraria[]>
}

export class AutoAsignarMateria {
  private readonly disponibilidadRepo: ObtenerDisponibilidadPort

  constructor (disponibilidadRepo: ObtenerDisponibilidadPort) {
    this.disponibilidadRepo = disponibilidadRepo
  }

  async execute (
    materia: Materia,
    horarioActual: Horario[],
    termId: string,
    seccion: number = 1,
    laboratorioId?: number,
    cedulaProfesor?: string,
    profesoresAsignados?: Record<string, Record<number, string>>
  ): Promise<Horario[]> {
    let disponibilidad: DisponibilidadHoraria[] = []
    if (cedulaProfesor) {
      disponibilidad = await this.disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesor, termId)
    }

    return autoAsignarMateria(
      materia,
      horarioActual,
      seccion,
      laboratorioId,
      cedulaProfesor,
      disponibilidad,
      profesoresAsignados
    )
  }
}
