import { type Horario, type DaysOfWeek } from '../../../../domain/Horario'
import { type DisponibilidadHoraria, MODULOS_HORARIO } from '../../../../domain/DisponibilidadHoraria'
import { type Materia } from '../../../../domain/Materia'

export interface ContextoChoques {
  dia: DaysOfWeek
  hora: string
  materia: Materia
  nroSeccion: number
  termId: string
  cedulaProfesor?: string
  laboratorioPrincipal?: number
  laboratoriosSecundarios?: number[]
  tuplasActualesYTemporales: Horario[]
  profesorAssignments: Record<string, Record<number, string>>
  profesorLabAssignments?: Record<string, Record<number, string>>
  disponibilidad: DisponibilidadHoraria[]
  soloPrioridad1: boolean
  prereqCodes?: Set<string>
  materiasComunesCodes?: Set<string>
}

export interface ResultadoChoque {
  estaOcupado: boolean
  labAAsignar?: number
}

export function verificarChoquesYDisponibilidad (ctx: ContextoChoques): ResultadoChoque {
  let estaOcupado = false
  let labAAsignar: number | undefined

  // 1. Choque del Mismo Semestre
  estaOcupado = ctx.tuplasActualesYTemporales.some((t) => {
    if (t.dia !== ctx.dia || t.hora !== ctx.hora) return false
    if (t.semestre === ctx.materia.semestre) {
      if (t.codAsig === ctx.materia.codMateria) {
        // Es la misma materia. Solo choca si es la MISMA sección.
        // Si son secciones distintas, pueden darse a la misma hora (el choque de profe se valida en regla 2).
        return t.nroSeccion === ctx.nroSeccion
      }
      // Es una materia distinta del mismo semestre. Chocan SIEMPRE.
      return true
    }
    return false
  })

  // 2. Choque de Profesor
  if (!estaOcupado && ctx.cedulaProfesor) {
    estaOcupado = ctx.tuplasActualesYTemporales.some((t) => {
      if (t.dia !== ctx.dia || t.hora !== ctx.hora) return false
      const hasLab = !!t.laboratorio || !!(t as any).codLaboratorio
      const profeAsignado = hasLab
        ? ctx.profesorLabAssignments?.[t.codAsig]?.[t.nroSeccion]
        : ctx.profesorAssignments[t.codAsig]?.[t.nroSeccion]
      return profeAsignado === ctx.cedulaProfesor
    })
  }

  // 3. Choques de Semestres Adyacentes
  if (!estaOcupado) {
    estaOcupado = ctx.tuplasActualesYTemporales.some((t) => {
      if (t.dia !== ctx.dia || t.hora !== ctx.hora) return false
      if (t.semestre === undefined) return false
      if (t.nroSeccion !== ctx.nroSeccion) return false // Solo evita choques de semestres si son para la misma cohorte (sección)

      const esAdyacente = Math.abs(t.semestre - ctx.materia.semestre) === 1
      if (esAdyacente) {
        const materiaChocandoEsPrerrequisito = ctx.prereqCodes?.has(t.codAsig)
        if (materiaChocandoEsPrerrequisito) {
          return false
        }

        const esMateriaComun = ctx.materia.esComun
        const materiaChocandoEsComun = ctx.materiasComunesCodes?.has(t.codAsig)
        if (esMateriaComun || materiaChocandoEsComun) {
          return false
        }

        return true
      }
      return false
    })
  }

  // 4. Choque de Laboratorio
  const isLab = !!(ctx.laboratorioPrincipal || (ctx.laboratoriosSecundarios && ctx.laboratoriosSecundarios.length > 0))
  if (!estaOcupado && isLab && ctx.laboratorioPrincipal) {
    const choquePrincipal = ctx.tuplasActualesYTemporales.some((t) =>
      t.dia === ctx.dia &&
      t.hora === ctx.hora &&
      t.laboratorio?.id === ctx.laboratorioPrincipal
    )

    if (!choquePrincipal) {
      labAAsignar = ctx.laboratorioPrincipal
    } else if (ctx.laboratoriosSecundarios && ctx.laboratoriosSecundarios.length > 0) {
      for (const secId of ctx.laboratoriosSecundarios) {
        const choqueSecundario = ctx.tuplasActualesYTemporales.some((t) =>
          t.dia === ctx.dia &&
          t.hora === ctx.hora &&
          t.laboratorio?.id === secId
        )
        if (!choqueSecundario) {
          labAAsignar = secId
          break
        }
      }
      if (!labAAsignar) {
        estaOcupado = true // Todos ocupados
      }
    } else {
      estaOcupado = true // Principal ocupado y no hay secundarios
    }
  }

  // 5. Disponibilidad del Profesor
  let nivelDispo = 1
  if (!estaOcupado && ctx.disponibilidad.length > 0) {
    const mod = MODULOS_HORARIO.find(m => m.horaInicio === ctx.hora)?.numeroModulo
    if (mod) {
      const dispo = ctx.disponibilidad.find(d => d.dia === ctx.dia && d.numeroModulo === mod)
      if (dispo) {
        nivelDispo = dispo.disponibilidad
      }
    }
  }

  if (nivelDispo === 0) estaOcupado = true
  if (ctx.soloPrioridad1 && nivelDispo !== 1) estaOcupado = true

  return { estaOcupado, labAAsignar }
}
