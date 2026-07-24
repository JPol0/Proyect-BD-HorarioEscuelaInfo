import { type Materia } from '../../../domain/Materia'
import { type Horario } from '../../../domain/Horario'
import { type DisponibilidadHoraria } from '../../../domain/DisponibilidadHoraria'
import { type Prerequito } from '../../../domain/Prerequito'
import { validarAsignacionesPrevias } from './AlgoritmoGeneracion/ValidarAsignacionesPrevias'
import { asignarSeccionesDeMateria } from './AlgoritmoGeneracion/AsignarSecciones'

export interface ObtenerDisponibilidadPort {
  obtenerPorProfesorYTerm: (cedula: string, termId: string) => Promise<DisponibilidadHoraria[]>
}

export interface GenerarHorarioRequest {
  materias: Materia[]
  prerequitos: Prerequito[]
  horarioActual: Horario[]
  termId: string
  selectedSemester?: number
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
    const { materias, prerequitos, horarioActual, termId, profesorAssignments, profesorLabAssignments, laboratorioAssignments } = request
    const advertencias: string[] = []
    let tuplasEnProceso = [...horarioActual]

    const cacheDisponibilidad: Record<string, DisponibilidadHoraria[]> = {}

    const materiasComunesCodes = new Set(
      materias.filter(m => m.esComun).map(m => m.codMateria)
    )

    const semestresUnicos = Array.from(new Set(materias.map(m => m.semestre))).sort((a, b) => a - b)

    for (const sem of semestresUnicos) {
      const materiasDelSemestre = materias.filter(m => m.semestre === sem)
      if (materiasDelSemestre.length === 0) continue

      // FASE 1: VALIDACIONES PREVIAS DEL SEMESTRE
      try {
        validarAsignacionesPrevias(materiasDelSemestre, tuplasEnProceso, profesorAssignments, profesorLabAssignments, laboratorioAssignments)
      } catch (e) {
        throw new Error(`[Semestre ${sem}] ${(e as Error).message}`)
      }

      // FASE 1.5: Asignar laboratorios a materias comunes del semestre
      for (const materia of materiasDelSemestre) {
        if (!materia.esComun) continue
        if (materia.horasLab === 0) continue

        const labObj = laboratorioAssignments[materia.codMateria]
        if (!labObj?.principal) continue

        tuplasEnProceso = tuplasEnProceso.map(t => {
          if (t.codAsig === materia.codMateria && !t.laboratorio) {
            return {
              ...t,
              laboratorio: { id: labObj.principal, name: '' }
            }
          }
          return t
        })
      }

      // FASE 2: MOTOR DE ASIGNACIÓN DEL SEMESTRE
      for (const materia of materiasDelSemestre) {
        if (materia.esComun) continue // Ya asignadas manualmente

        const prereqCodes = new Set(
          prerequitos
            .filter(p => p.codigoAsignatura === materia.codMateria)
            .map(p => p.codigoAsignaturaPrerequito)
        )

        const resultado = await asignarSeccionesDeMateria({
          materia,
          prereqCodes,
          materiasComunesCodes,
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
    }

    return {
      horarioActualizado: tuplasEnProceso,
      errores: [],
      advertencias
    }
  }
}
