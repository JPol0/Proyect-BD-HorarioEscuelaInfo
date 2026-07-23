import { type Materia } from '../../../domain/Materia'
import { type Horario, type DaysOfWeek } from '../../../domain/Horario'
import { type DisponibilidadHoraria } from '../../../domain/DisponibilidadHoraria'
import { type Prerequito } from '../../../domain/Prerequito'
import { verificarChoquesYDisponibilidad, type ContextoChoques } from './AlgoritmoGeneracion/VerificadorChoques'

export interface ObtenerDisponibilidadPort {
  obtenerPorProfesorYTerm: (cedula: string, termId: string) => Promise<DisponibilidadHoraria[]>
}

export interface ValidarMovimientoRequest {
  targetDay: DaysOfWeek
  targetHour: string
  asigsToMove: Horario[]
  tuplas: Horario[]
  selectedTerm: string
  selectedSemester: number
  materias: Materia[]
  prerequitos: Prerequito[]
  profesorAssignments: Record<string, Record<number, string>>
  profesorLabAssignments?: Record<string, Record<number, string>>
  laboratorioAssignments: Record<string, { principal: number, secundarios: number[] }>
}

export interface ValidarMovimientoResponse {
  esValido: boolean
  mensajeError?: string
}

export class ValidarMovimientoHorario {
  private readonly disponibilidadRepo: ObtenerDisponibilidadPort

  constructor (disponibilidadRepo: ObtenerDisponibilidadPort) {
    this.disponibilidadRepo = disponibilidadRepo
  }

  async execute (request: ValidarMovimientoRequest): Promise<ValidarMovimientoResponse> {
    const {
      targetDay,
      targetHour,
      asigsToMove,
      tuplas,
      selectedTerm,
      selectedSemester,
      materias,
      prerequitos,
      profesorAssignments,
      profesorLabAssignments,
      laboratorioAssignments
    } = request

    if (asigsToMove.length === 0) {
      return { esValido: true }
    }

    const draggedDay = asigsToMove[0].dia
    const draggedHour = asigsToMove[0].hora

    const newTuplas = tuplas.filter(
      t => !(t.dia === draggedDay && t.hora === draggedHour && t.semestre === selectedSemester)
    )

    const materiasComunesCodes = new Set(
      materias.filter(m => m.esComun).map(m => m.codMateria)
    )

    for (const asig of asigsToMove) {
      const materia = materias.find(m => m.codMateria === asig.codAsig)
      if (!materia) continue

      const prereqCodes = new Set(
        prerequitos
          .filter(p => p.codigoAsignatura === materia.codMateria)
          .map(p => p.codigoAsignaturaPrerequito)
      )

      const hasLab = !asig.laboratorio || !(asig as any).codLaboratorio
      const cedulaProfesor = (hasLab
        ? profesorLabAssignments?.[asig.codAsig]?.[asig.nroSeccion]
        : undefined) ||
        profesorAssignments[asig.codAsig]?.[asig.nroSeccion] ||
        profesorLabAssignments?.[asig.codAsig]?.[asig.nroSeccion]

      let dispoProfesor: DisponibilidadHoraria[] = []
      if (cedulaProfesor && selectedTerm) {
        try {
          dispoProfesor = await this.disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesor, selectedTerm)
        } catch {
          dispoProfesor = []
        }
      }

      const labObj = laboratorioAssignments[asig.codAsig]

      const ctx: ContextoChoques = {
        dia: targetDay,
        hora: targetHour,
        materia,
        nroSeccion: asig.nroSeccion,
        termId: selectedTerm,
        cedulaProfesor,
        laboratorioPrincipal: labObj?.principal,
        laboratoriosSecundarios: labObj?.secundarios,
        tuplasActualesYTemporales: newTuplas,
        profesorAssignments: profesorAssignments || {},
        profesorLabAssignments: profesorLabAssignments || {},
        disponibilidad: dispoProfesor,
        soloPrioridad1: false,
        prereqCodes,
        materiasComunesCodes
      }

      const { estaOcupado } = verificarChoquesYDisponibilidad(ctx)
      if (estaOcupado) {
        return {
          esValido: false,
          mensajeError: `No se puede mover la materia ${materia.nombre} a este bloque (${targetDay} ${targetHour}) debido a choques de horario o falta de disponibilidad del profesor.`
        }
      }
    }

    return { esValido: true }
  }
}
