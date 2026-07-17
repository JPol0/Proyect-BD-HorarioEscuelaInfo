import { type Materia } from '../../../domain/Materia'
import { type Horario } from '../../../domain/Horario'
import { type DisponibilidadHoraria } from '../../../domain/DisponibilidadHoraria'
import { validarAsignacionesPrevias } from './AlgoritmoGeneracion/ValidarAsignacionesPrevias'
import { asignarSeccionesDeMateria } from './AlgoritmoGeneracion/AsignarSecciones'

export interface ObtenerDisponibilidadPort {
  obtenerPorProfesorYTerm: (cedula: string, termId: string) => Promise<DisponibilidadHoraria[]>
}

export interface GenerarHorarioRequest {
  materias: Materia[]
  horarioActual: Horario[]
  termId: string
  selectedSemester: number
  profesorAssignments: Record<string, Record<number, string>> // codMateria -> seccion -> cedulaProf
  profesorLabAssignments?: Record<string, Record<number, string>> // codMateria -> seccion -> cedulaProf
  laboratorioAssignments: Record<string, { principal: number, secundarios: number[] }> // codMateria -> asignacion
}

export interface GenerarHorarioResponse {
  horarioActualizado: Horario[]
  errores: string[]
  advertencias: string[]
}

export class GenerarHorarioSemestre {
  private readonly disponibilidadRepo: ObtenerDisponibilidadPort

  constructor (disponibilidadRepo: ObtenerDisponibilidadPort) {
    this.disponibilidadRepo = disponibilidadRepo
  }

  async execute (request: GenerarHorarioRequest): Promise<GenerarHorarioResponse> {
    const { materias, horarioActual, termId, selectedSemester, profesorAssignments, profesorLabAssignments, laboratorioAssignments } = request
    const advertencias: string[] = []
    let tuplasEnProceso = [...horarioActual]

    const materiasDelSemestre = materias.filter(m => m.semestre === selectedSemester)

    // FASE 1: VALIDACIONES PREVIAS
    try {
      validarAsignacionesPrevias(materiasDelSemestre, tuplasEnProceso, profesorAssignments, profesorLabAssignments, laboratorioAssignments)
    } catch (e) {
      throw new Error((e as Error).message)
    }

    // Cache de disponibilidades para no consultar múltiples veces por el mismo profesor
    const cacheDisponibilidad: Record<string, DisponibilidadHoraria[]> = {}

    // FASE 2: MOTOR DE ASIGNACIÓN
    for (const materia of materiasDelSemestre) {
      if (materia.esComun) continue // Ya asignadas manualmente

      const resultado = await asignarSeccionesDeMateria({
        materia,
        tuplasEnProceso,
        termId,
        profesorAssignments,
        profesorLabAssignments,
        laboratorioAssignments,
        cacheDisponibilidad,
        disponibilidadRepo: this.disponibilidadRepo
      })

      tuplasEnProceso = resultado.tuplasActualizadas
      if (resultado.advertencias.length > 0) {
        advertencias.push(...resultado.advertencias)
      }
    }

    return {
      horarioActualizado: tuplasEnProceso,
      errores: [],
      advertencias
    }
  }
}
