import { type Horario, type DaysOfWeek } from '../../../../domain/Horario'
import { type DisponibilidadHoraria, MODULOS_HORARIO } from '../../../../domain/DisponibilidadHoraria'
import { type Materia } from '../../../../domain/Materia'

export interface ContextoChoques {
  dia: DaysOfWeek
  hora: string
  materia: Materia
  termId: string
  cedulaProfesor?: string
  laboratorioPrincipal?: string
  laboratorioSecundario?: string
  tuplasActualesYTemporales: Horario[]
  profesorAssignments: Record<string, Record<number, string>>
  profesorLabAssignments?: Record<string, Record<number, string>>
  disponibilidad: DisponibilidadHoraria[]
  soloPrioridad1: boolean
}

export interface ResultadoChoque {
  estaOcupado: boolean
  labAAsignar?: string
}

export function verificarChoquesYDisponibilidad(ctx: ContextoChoques): ResultadoChoque {
  let estaOcupado = false
  let labAAsignar: string | undefined = undefined

  // 1. Choque del Mismo Semestre
  estaOcupado = ctx.tuplasActualesYTemporales.some((t) => t.dia === ctx.dia && t.hora === ctx.hora && t.semestre === ctx.materia.semestre)

  // 2. Choque de Profesor
  if (!estaOcupado && ctx.cedulaProfesor) {
    estaOcupado = ctx.tuplasActualesYTemporales.some((t) => {
      if (t.dia !== ctx.dia || t.hora !== ctx.hora || t.codTerm !== ctx.termId) return false
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

      const esAdyacente = Math.abs(t.semestre - ctx.materia.semestre) === 1
      if (esAdyacente) {
        const materiaChocandoEsPrerrequisito = ctx.materia.prerrequisitos?.some(p => p.codMateria === t.codAsig)
        if (materiaChocandoEsPrerrequisito) {
          return false
        }
        return true
      }
      return false
    })
  }

  // 4. Choque de Laboratorio
  const isLab = !!(ctx.laboratorioPrincipal || ctx.laboratorioSecundario)
  if (!estaOcupado && isLab && ctx.laboratorioPrincipal) {
    const choquePrincipal = ctx.tuplasActualesYTemporales.some((t) =>
      t.dia === ctx.dia &&
      t.hora === ctx.hora &&
      (t.laboratorio?.id === ctx.laboratorioPrincipal || (t as any).codLaboratorio === ctx.laboratorioPrincipal)
    )

    if (!choquePrincipal) {
      labAAsignar = ctx.laboratorioPrincipal
    } else if (ctx.laboratorioSecundario) {
      const choqueSecundario = ctx.tuplasActualesYTemporales.some((t) =>
        t.dia === ctx.dia &&
        t.hora === ctx.hora &&
        (t.laboratorio?.id === ctx.laboratorioSecundario || (t as any).codLaboratorio === ctx.laboratorioSecundario)
      )
      if (!choqueSecundario) {
        labAAsignar = ctx.laboratorioSecundario
      } else {
        estaOcupado = true // Ambos ocupados
      }
    } else {
      estaOcupado = true // Principal ocupado y no hay secundario
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
