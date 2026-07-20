import { type Materia } from '../../../../domain/Materia'
import { type Horario } from '../../../../domain/Horario'
import { type DisponibilidadHoraria } from '../../../../domain/DisponibilidadHoraria'
import { DIAS_SEMANA_BASE, convertirARomano } from './ValidarAsignacionesPrevias'
import { intentarAsignarBloque } from './BuscadorBloquesLibres'

export interface AsignarSeccionesParams {
  materia: Materia
  prereqCodes?: Set<string>
  tuplasEnProceso: Horario[]
  termId: string
  profesorAssignments: Record<string, Record<number, string>>
  profesorLabAssignments?: Record<string, Record<number, string>>
  laboratorioAssignments: Record<string, { principal: number, secundarios: number[] }>
  cacheDisponibilidad: Record<string, DisponibilidadHoraria[]>
  disponibilidadRepo: { obtenerPorProfesorYTerm: (cedula: string, termId: string) => Promise<DisponibilidadHoraria[]> }
}

export interface AsignarSeccionesResult {
  tuplasActualizadas: Horario[]
  advertencias: string[]
}

export async function asignarSeccionesDeMateria (params: AsignarSeccionesParams): Promise<AsignarSeccionesResult> {
  const { materia, prereqCodes, termId, profesorAssignments, profesorLabAssignments, laboratorioAssignments, cacheDisponibilidad, disponibilidadRepo } = params
  let tuplasActualizadas = [...params.tuplasEnProceso]
  const advertencias: string[] = []
  let falloSeccionAnterior = false

  const horasTeoPrac = materia.horasTeo + materia.horasPrac
  const totalHoras = horasTeoPrac + materia.horasLab
  if (totalHoras === 0) return { tuplasActualizadas, advertencias }

  const nroSecciones = Math.max(1, materia.nroSecciones)

  for (let sec = 1; sec <= nroSecciones; sec++) {
    if (falloSeccionAnterior) {
      advertencias.push(`No se intentó asignar ${materia.nombre} (Sección ${convertirARomano(sec)}) porque la sección anterior falló.`)
      continue
    }

    const isAssigned = tuplasActualizadas.some(t => t.codAsig === materia.codMateria && t.nroSeccion === sec)
    if (isAssigned) continue
    const cedulaProfesorTeoria = profesorAssignments[materia.codMateria]?.[sec]
    const cedulaProfesorLab = profesorLabAssignments?.[materia.codMateria]?.[sec]
    const labObj = laboratorioAssignments[materia.codMateria]
    const laboratorioPrincipal = labObj?.principal
    const laboratorioSecundarios = labObj?.secundarios || []

    if (cedulaProfesorTeoria && !cacheDisponibilidad[cedulaProfesorTeoria]) {
      cacheDisponibilidad[cedulaProfesorTeoria] = await disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesorTeoria, termId)
    }
    if (cedulaProfesorLab && !cacheDisponibilidad[cedulaProfesorLab]) {
      cacheDisponibilidad[cedulaProfesorLab] = await disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesorLab, termId)
    }

    const diasPermitidos = materia.modalidad === 'VIT'
      ? [...DIAS_SEMANA_BASE]
      : DIAS_SEMANA_BASE.slice(0, 5) // Lunes a Viernes

    let nuevasTuplasSeccion: Horario[] = []

    const intentarAsignar = (horasNecesarias: number, tipo: 'Laboratorio' | 'Teoría/Práctica', soloPrioridad1: boolean, permitirDivision3Horas: boolean = false): boolean => {
      const cedulaProfesor = tipo === 'Laboratorio' ? cedulaProfesorLab : cedulaProfesorTeoria
      const disponibilidad = cedulaProfesor ? cacheDisponibilidad[cedulaProfesor] : []
      const tuplasTemporales: Horario[] = []

      const ctxBase = {
        materia,
        prereqCodes,
        nroSeccion: sec,
        termId,
        cedulaProfesor,
        laboratorioPrincipal: tipo === 'Laboratorio' ? laboratorioPrincipal : undefined,
        laboratoriosSecundarios: tipo === 'Laboratorio' ? laboratorioSecundarios : undefined,
        tuplasActualesYTemporales: tuplasActualizadas,
        profesorAssignments,
        profesorLabAssignments,
        disponibilidad,
        soloPrioridad1
      }

      let maxHorasPorDia = 1
      if (horasNecesarias === 2) {
        maxHorasPorDia = 2
      } else if (horasNecesarias === 3) {
        maxHorasPorDia = 3
      } else if (horasNecesarias === 4) {
        maxHorasPorDia = 2
      } else if (horasNecesarias === 5) {
        maxHorasPorDia = 3
      } else if (horasNecesarias >= 6) {
        maxHorasPorDia = 2
      }

      const exito = intentarAsignarBloque(horasNecesarias, sec, tipo, maxHorasPorDia, diasPermitidos, ctxBase, nuevasTuplasSeccion, tuplasTemporales, permitirDivision3Horas)
      if (exito) {
        nuevasTuplasSeccion = nuevasTuplasSeccion.concat(tuplasTemporales)
      }
      return exito
    }

    const asignarBloques = (horasNecesarias: number, tipo: 'Laboratorio' | 'Teoría/Práctica') => {
      let exito = intentarAsignar(horasNecesarias, tipo, true)
      if (!exito) {
        exito = intentarAsignar(horasNecesarias, tipo, false)
      }

      // EXCEPCIÓN: Si es laboratorio, de exactamente 3 horas, y falló, intentar dividiendo en 2 + 1
      if (!exito && tipo === 'Laboratorio' && materia.horasLab === 3 && horasNecesarias === 3) {
        exito = intentarAsignar(horasNecesarias, tipo, false, true)
      }

      if (!exito) {
        if (tipo === 'Laboratorio' && laboratorioPrincipal) {
          throw new Error(`El laboratorio asignado a ${materia.nombre} (Sección ${convertirARomano(sec)}) no tiene disponibilidad de horas o la sección presenta choques de horarios con otras materias.`)
        }
        const cedulaProf = tipo === 'Laboratorio' ? cedulaProfesorLab : cedulaProfesorTeoria
        if (cedulaProf) {
          throw new Error(`El profesor asignado a ${materia.nombre} (Sección ${convertirARomano(sec)}) no tiene disponibilidad de horas o la sección presenta choques de horarios con otras materias.`)
        }
        throw new Error(`No hay suficiente espacio en el horario para asignar todas las horas de ${tipo} de ${materia.nombre} (Sección ${convertirARomano(sec)}).`)
      }
    }

    try {
      if (materia.horasLab > 0) {
        asignarBloques(materia.horasLab, 'Laboratorio')
      }
      if (horasTeoPrac > 0) {
        asignarBloques(horasTeoPrac, 'Teoría/Práctica')
      }
      tuplasActualizadas = [...tuplasActualizadas, ...nuevasTuplasSeccion]
    } catch (e) {
      falloSeccionAnterior = true
      advertencias.push(e instanceof Error ? e.message : `No se pudo asignar ${materia.nombre} (Sección ${convertirARomano(sec)})`)
    }
  }

  return { tuplasActualizadas, advertencias }
}
