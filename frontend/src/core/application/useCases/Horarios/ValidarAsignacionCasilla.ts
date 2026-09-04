import { type Materia } from '../../../domain/Materia'
import { type Horario, type DaysOfWeek } from '../../../domain/Horario'
import { type DisponibilidadHoraria, MODULOS_HORARIO } from '../../../domain/DisponibilidadHoraria'
import { type Prerequito } from '../../../domain/Prerequito'
import { convertirARomano } from './AlgoritmoGeneracion/ValidarAsignacionesPrevias'

export interface ObtenerDisponibilidadPort {
  obtenerPorProfesorYTerm: (cedula: string, termId: string) => Promise<DisponibilidadHoraria[]>
}

export interface ValidarAsignacionRequest {
  dia: DaysOfWeek
  hora: string
  materia: Materia
  nroSeccion: number
  tipo: 'Teoría/Práctica' | 'Laboratorio'
  laboratorioId?: number
  tuplas: Horario[]
  selectedTerm: string
  materias: Materia[]
  prerequitos: Prerequito[]
  profesorAssignments: Record<string, Record<number, string>>
  profesorLabAssignments?: Record<string, Record<number, string>>
  laboratorioAssignments: Record<string, { principal: number, secundarios: number[] }>
}

export interface ValidarAsignacionResponse {
  esValido: boolean
  mensajeError?: string
  cedulaProfesor?: string
  labIdAsignado?: number
}

export class ValidarAsignacionCasilla {
  private readonly disponibilidadRepo: ObtenerDisponibilidadPort

  constructor (disponibilidadRepo: ObtenerDisponibilidadPort) {
    this.disponibilidadRepo = disponibilidadRepo
  }

  async execute (request: ValidarAsignacionRequest): Promise<ValidarAsignacionResponse> {
    const {
      dia,
      hora,
      materia,
      nroSeccion,
      tipo,
      laboratorioId,
      tuplas,
      selectedTerm,
      prerequitos,
      profesorAssignments,
      profesorLabAssignments,
      laboratorioAssignments
    } = request

    // 1. Verificar si la casilla ya está ocupada en este mismo semestre
    const ocupadaMismoSemestre = tuplas.some(
      t => t.dia === dia && t.hora === hora && t.semestre === materia.semestre
    )
    if (ocupadaMismoSemestre) {
      return {
        esValido: false,
        mensajeError: `La casilla (${dia} ${hora}) ya está ocupada por otra asignatura en el Semestre ${convertirARomano(materia.semestre)}.`
      }
    }

    // 2. Validar restricciones de modalidad (PRE: solo Lunes-Viernes y hasta las 18:00)
    const horaNum = parseInt(hora.split(':')[0], 10)
    if (materia.modalidad === 'PRE') {
      if (dia === 'Sabado' || dia === 'Domingo') {
        return {
          esValido: false,
          mensajeError: 'Las asignaturas presenciales (PRE) no pueden impartirse en fines de semana.'
        }
      }
      if (horaNum > 18) {
        return {
          esValido: false,
          mensajeError: 'Las asignaturas presenciales (PRE) no pueden impartirse después de las 18:00 (último bloque permitido es 18:00 - 18:50).'
        }
      }
    }

    // 3. Validar límite de horas semanales para la sección
    const tuplasSeccion = tuplas.filter(
      t => t.codAsig === materia.codMateria && t.nroSeccion === nroSeccion
    )
    const horasRequeridas = tipo === 'Laboratorio'
      ? materia.horasLab
      : (materia.horasTeo + materia.horasPrac)

    const tuplasTipo = tuplasSeccion.filter(t =>
      tipo === 'Laboratorio' ? (t.laboratorio !== null && t.laboratorio !== undefined) : (!t.laboratorio)
    )

    if (tuplasTipo.length >= horasRequeridas) {
      return {
        esValido: false,
        mensajeError: `La Sección ${convertirARomano(nroSeccion)} de ${materia.nombre} ya tiene asignadas todas sus horas de ${tipo} (${tuplasTipo.length}/${horasRequeridas}).`
      }
    }

    // 4. Validar reglas del día (Separación de Teoría/Lab y Continuidad dentro del día)
    const tuplasHoy = tuplasSeccion.filter(t => t.dia === dia)
    if (tuplasHoy.length > 0) {
      // 4.1. Separación: no mezclar teoría y laboratorio el mismo día
      const hayLabHoy = tuplasHoy.some(t => t.laboratorio !== null && t.laboratorio !== undefined)
      if (tipo === 'Laboratorio' && !hayLabHoy) {
        return {
          esValido: false,
          mensajeError: 'No se pueden asignar horas de laboratorio y teoría el mismo día para una misma sección.'
        }
      }
      if (tipo === 'Teoría/Práctica' && hayLabHoy) {
        return {
          esValido: false,
          mensajeError: 'No se pueden asignar horas de teoría y laboratorio el mismo día para una misma sección.'
        }
      }

      // 4.2. Máximo de horas diarias (máximo 3 horas en un día)
      if (tuplasHoy.length >= 3) {
        return {
          esValido: false,
          mensajeError: 'Una sección no puede tener más de 3 horas de clase en un mismo día.'
        }
      }

      // 4.3. Continuidad obligatoria: la nueva hora debe ser consecutiva/adyacente a las horas ya asignadas hoy
      const horasHoyNums = tuplasHoy.map(t => parseInt(t.hora.split(':')[0], 10))
      const minHora = Math.min(...horasHoyNums)
      const maxHora = Math.max(...horasHoyNums)
      const esConsecutiva = horaNum === minHora - 1 || horaNum === maxHora + 1

      if (!esConsecutiva) {
        return {
          esValido: false,
          mensajeError: `Las horas de clase en un mismo día deben ser estrictamente continuas. Para este día solo puedes agregar a las ${minHora - 1 < 10 ? `0${minHora - 1}` : minHora - 1}:00 o a las ${maxHora + 1 < 10 ? `0${maxHora + 1}` : maxHora + 1}:00.`
        }
      }
    }

    // 5. Validar profesor asignado
    const cedulaProfesor = tipo === 'Laboratorio'
      ? (profesorLabAssignments?.[materia.codMateria]?.[nroSeccion] || '')
      : (profesorAssignments[materia.codMateria]?.[nroSeccion] || '')

    if (!cedulaProfesor) {
      return {
        esValido: false,
        mensajeError: `La Sección ${convertirARomano(nroSeccion)} aún no tiene un profesor asignado para ${tipo}. Por favor asígnalo primero.`
      }
    }

    // 6. Validar laboratorio asignado (si es Laboratorio)
    let labIdFinal = laboratorioId
    if (tipo === 'Laboratorio') {
      const labConfig = laboratorioAssignments[materia.codMateria]
      if (!labIdFinal) {
        labIdFinal = labConfig?.principal
      }
      if (!labIdFinal) {
        return {
          esValido: false,
          mensajeError: `La asignatura ${materia.nombre} requiere laboratorio pero no tiene laboratorio asignado.`
        }
      }

      // Verificar si el laboratorio está ocupado en ese día y hora
      const labOcupado = tuplas.some(
        t => t.dia === dia && t.hora === hora && t.laboratorio?.id === labIdFinal
      )
      if (labOcupado) {
        return {
          esValido: false,
          mensajeError: `El laboratorio asignado ya se encuentra ocupado en este horario (${dia} ${hora}) por otra asignatura.`
        }
      }
    }

    // 7. Validar choque de profesor (que el profesor no esté dictando a la misma hora)
    const profOcupado = tuplas.some(t => {
      if (t.dia !== dia || t.hora !== hora) return false
      const hasLab = !!t.laboratorio || !!(t as any).codLaboratorio
      const profeTupla = t.cedulaP || (hasLab
        ? profesorLabAssignments?.[t.codAsig]?.[t.nroSeccion]
        : profesorAssignments[t.codAsig]?.[t.nroSeccion])
      return profeTupla === cedulaProfesor
    })

    if (profOcupado) {
      return {
        esValido: false,
        mensajeError: `El profesor asignado ya tiene una clase asignada en el horario (${dia} ${hora}).`
      }
    }

    // 8. Validar disponibilidad del profesor
    if (selectedTerm) {
      try {
        const disponibilidad = await this.disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesor, selectedTerm)
        if (disponibilidad && disponibilidad.length > 0) {
          const mod = MODULOS_HORARIO.find(m => m.horaInicio === hora)?.numeroModulo
          if (mod) {
            const registroDispo = disponibilidad.find(d => d.dia === dia && d.numeroModulo === mod)
            if (registroDispo && registroDispo.disponibilidad === 0) {
              return {
                esValido: false,
                mensajeError: `El profesor no tiene disponibilidad horaria registrada en este bloque (${dia} ${hora}).`
              }
            }
          }
        }
      } catch {
        // Si no se pudo obtener disponibilidad, no bloqueamos la validación
      }
    }

    // 9. Validar choque con semestres adyacentes (N-1 y N+1)
    const prereqCodes = new Set(
      prerequitos
        .filter(p => p.codigoAsignatura === materia.codMateria)
        .map(p => p.codigoAsignaturaPrerequito)
    )

    const choqueAdyacente = tuplas.some(t => {
      if (t.dia !== dia || t.hora !== hora) return false
      if (t.semestre === undefined) return false
      if (t.nroSeccion !== nroSeccion) return false // Solo para la misma cohorte

      const esAdyacente = Math.abs(t.semestre - materia.semestre) === 1
      if (esAdyacente) {
        // Se permite el choque si t es prerrequisito de materia
        if (prereqCodes.has(t.codAsig)) {
          return false
        }
        return true
      }
      return false
    })

    if (choqueAdyacente) {
      return {
        esValido: false,
        mensajeError: `Existe un choque de horarios con una materia de semestre adyacente (Semestre ${convertirARomano(materia.semestre - 1)} o ${convertirARomano(materia.semestre + 1)}) para la misma cohorte sin relación de prelación.`
      }
    }

    return {
      esValido: true,
      cedulaProfesor,
      labIdAsignado: tipo === 'Laboratorio' ? labIdFinal : undefined
    }
  }
}
