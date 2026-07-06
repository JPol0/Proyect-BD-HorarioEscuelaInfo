import { type Materia } from '../../../domain/Materia'
import { type Horario, type DaysOfWeek } from '../../../domain/Horario'
import { type DisponibilidadHoraria, MODULOS_HORARIO } from '../../../domain/DisponibilidadHoraria'

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
  laboratorioAssignments: Record<string, Record<number, string>> // codMateria -> seccion -> labId
}

export interface GenerarHorarioResponse {
  horarioActualizado: Horario[]
  errores: string[]
  advertencias: string[]
}

const DIAS_SEMANA_BASE: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const HORAS_DISPONIBLES_BASE = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
]

const convertirARomano = (num: number): string => {
  const valoresRomanos: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let resultado = ''
  let valorRestante = num
  for (const key in valoresRomanos) {
    while (valorRestante >= valoresRomanos[key]) {
      resultado += key
      valorRestante -= valoresRomanos[key]
    }
  }
  return resultado
}

export class GenerarHorarioSemestre {
  private readonly disponibilidadRepo: ObtenerDisponibilidadPort

  constructor (disponibilidadRepo: ObtenerDisponibilidadPort) {
    this.disponibilidadRepo = disponibilidadRepo
  }

  async execute (request: GenerarHorarioRequest): Promise<GenerarHorarioResponse> {
    const { materias, horarioActual, termId, selectedSemester, profesorAssignments, profesorLabAssignments, laboratorioAssignments } = request
    const errores: string[] = []
    const advertencias: string[] = []
    let tuplasEnProceso = [...horarioActual]

    const materiasDelSemestre = materias.filter(m => m.semestre === selectedSemester)

    // FASE 1: VALIDACIONES PREVIAS
    const missingProfessors: string[] = []
    const missingLabs: string[] = []
    const missingCommonSchedules: string[] = []

    for (const materia of materiasDelSemestre) {
      const nroSecciones = Math.max(1, materia.nroSecciones)
      for (let sec = 1; sec <= nroSecciones; sec++) {
        const cedulaProf = profesorAssignments[materia.codMateria]?.[sec]
        if (!cedulaProf) {
          missingProfessors.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)}) (Teoría/Práctica)`)
        }

        if (materia.horasLab > 0) {
          const labId = laboratorioAssignments[materia.codMateria]?.[sec]
          if (!labId) {
            missingLabs.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)})`)
          }
          const cedulaProfLab = profesorLabAssignments?.[materia.codMateria]?.[sec]
          if (!cedulaProfLab) {
            missingProfessors.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)}) (Laboratorio)`)
          }
        }

        if (materia.esComun) {
          const isAssigned = tuplasEnProceso.some(t => t.codAsig === materia.codMateria && t.nroSeccion === sec)
          if (!isAssigned) {
            missingCommonSchedules.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)})`)
          }
        }
      }
    }

    if (missingProfessors.length > 0) {
      throw new Error(`Aún no se le han asignado profesores a las siguientes materias:\n\n${missingProfessors.join('\n')}`)
    }

    if (missingLabs.length > 0) {
      throw new Error(`Aún no se le han asignado laboratorios a las siguientes materias (requerido por tener horas de lab):\n\n${missingLabs.join('\n')}`)
    }

    if (missingCommonSchedules.length > 0) {
      throw new Error(`En las materias comunes aún no se han asignado los horarios para las siguientes secciones:\n\n${missingCommonSchedules.join('\n')}`)
    }

    // Cache de disponibilidades para no consultar múltiples veces por el mismo profesor
    const cacheDisponibilidad: Record<string, DisponibilidadHoraria[]> = {}

    // FASE 2: MOTOR DE ASIGNACIÓN
    for (const materia of materiasDelSemestre) {
      if (materia.esComun) continue // Ya asignadas manualmente

      const horasTeoPrac = materia.horasTeo + materia.horasPrac
      const totalHoras = horasTeoPrac + materia.horasLab
      if (totalHoras === 0) continue

      const nroSecciones = Math.max(1, materia.nroSecciones)

      for (let sec = 1; sec <= nroSecciones; sec++) {
        // Si ya está asignada manualmente, omitir
        const isAssigned = tuplasEnProceso.some(t => t.codAsig === materia.codMateria && t.nroSeccion === sec)
        if (isAssigned) continue

        const maxHorasPorDia = totalHoras === 6 ? 2 : 3
        const cedulaProfesorTeoria = profesorAssignments[materia.codMateria]?.[sec]
        const cedulaProfesorLab = profesorLabAssignments?.[materia.codMateria]?.[sec]
        const laboratorioId = laboratorioAssignments[materia.codMateria]?.[sec]

        if (cedulaProfesorTeoria && !cacheDisponibilidad[cedulaProfesorTeoria]) {
          cacheDisponibilidad[cedulaProfesorTeoria] = await this.disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesorTeoria, termId)
        }
        if (cedulaProfesorLab && !cacheDisponibilidad[cedulaProfesorLab]) {
          cacheDisponibilidad[cedulaProfesorLab] = await this.disponibilidadRepo.obtenerPorProfesorYTerm(cedulaProfesorLab, termId)
        }

        const diasPermitidos: DaysOfWeek[] = materia.modalidad === 'VIT'
          ? [...DIAS_SEMANA_BASE]
          : DIAS_SEMANA_BASE.slice(0, 5) // Lunes a Viernes

        // Para esta sección específica
        let nuevasTuplasSeccion: Horario[] = []

        const intentarAsignar = (horasNecesarias: number, tipo: 'Laboratorio' | 'Teoría/Práctica', soloPrioridad1: boolean): boolean => {
          const cedulaProfesor = tipo === 'Laboratorio' ? cedulaProfesorLab : cedulaProfesorTeoria
          const disponibilidad = cedulaProfesor ? cacheDisponibilidad[cedulaProfesor] : []
          let faltantes = horasNecesarias
          const tuplasTemporales: Horario[] = []

          // Aleatorizar días para no sobrecargar el principio de la semana
          const diasAleatorios = [...diasPermitidos].sort(() => Math.random() - 0.5)

          for (const dia of diasAleatorios) {
            if (faltantes <= 0) break

            // Regla: Bloque único diario para esta sección
            const tieneHorasHoy = nuevasTuplasSeccion.some((t) => t.dia === dia) || tuplasTemporales.some((t) => t.dia === dia)
            if (tieneHorasHoy) continue

            const maxPosiblesHoy = Math.min(faltantes, maxHorasPorDia)
            let bloqueActual: string[] = []
            const bloquesLibres: string[][] = []

            for (const hora of HORAS_DISPONIBLES_BASE) {
              let estaOcupado = false

              // Choques con la lista completa temporal
              const tuplasActualesYTemporales = [...tuplasEnProceso, ...nuevasTuplasSeccion, ...tuplasTemporales]

              // 1. Choque del Mismo Semestre (Nunca permitido)
              if (!estaOcupado) {
                estaOcupado = tuplasActualesYTemporales.some((t) => t.dia === dia && t.hora === hora && t.semestre === materia.semestre)
              }

              // 2. Choque de Profesor (Nunca permitido)
              if (!estaOcupado && cedulaProfesor) {
                estaOcupado = tuplasActualesYTemporales.some((t) => {
                  if (t.dia !== dia || t.hora !== hora || t.codTerm !== termId) return false
                  const hasLab = !!t.laboratorio || !!(t as any).codLaboratorio
                  const profeAsignado = hasLab 
                    ? profesorLabAssignments?.[t.codAsig]?.[t.nroSeccion]
                    : profesorAssignments[t.codAsig]?.[t.nroSeccion]
                  return profeAsignado === cedulaProfesor
                })
              }

              // 3. Choques de Semestres Adyacentes (N-1 y N+1) con Excepción de Prerrequisitos
              if (!estaOcupado) {
                estaOcupado = tuplasActualesYTemporales.some((t) => {
                  if (t.dia !== dia || t.hora !== hora) return false
                  if (t.semestre === undefined) return false

                  const esAdyacente = Math.abs(t.semestre - materia.semestre) === 1
                  if (esAdyacente) {
                    const materiaChocandoEsPrerrequisito = materia.prerrequisitos?.some(p => p.codMateria === t.codAsig)
                    if (materiaChocandoEsPrerrequisito) {
                      return false // Permite solapamiento si es prerrequisito (el choque de profesor ya se validó arriba)
                    }
                    return true // Chocan y no es prerrequisito -> Ocupado
                  }
                  return false
                })
              }

              // 4. Choque de Laboratorio
              if (!estaOcupado && tipo === 'Laboratorio' && laboratorioId) {
                estaOcupado = tuplasActualesYTemporales.some((t) =>
                  t.dia === dia &&
                  t.hora === hora &&
                  (t.laboratorio?.id === laboratorioId || (t as any).codLaboratorio === laboratorioId)
                )
              }

              // 5. Disponibilidad del Profesor
              let nivelDispo = 1
              if (!estaOcupado && disponibilidad.length > 0) {
                const mod = MODULOS_HORARIO.find(m => m.horaInicio === hora)?.numeroModulo
                if (mod) {
                  const dispo = disponibilidad.find(d => d.dia === dia && d.numeroModulo === mod)
                  if (dispo) {
                    nivelDispo = dispo.disponibilidad
                  }
                }
              }

              if (nivelDispo === 0) estaOcupado = true
              if (soloPrioridad1 && nivelDispo !== 1) estaOcupado = true

              // Llenado de bloques contiguos
              if (!estaOcupado) {
                bloqueActual.push(hora)
              } else {
                if (bloqueActual.length > 0) {
                  bloquesLibres.push(bloqueActual)
                  bloqueActual = []
                }
              }
            }
            if (bloqueActual.length > 0) {
              bloquesLibres.push(bloqueActual)
            }

            bloquesLibres.sort((a, b) => b.length - a.length)

            if (bloquesLibres.length > 0) {
              const mejorBloque = bloquesLibres[0]
              const horasAAsignar = mejorBloque.slice(0, Math.min(mejorBloque.length, maxPosiblesHoy))

              for (const hora of horasAAsignar) {
                tuplasTemporales.push({
                  codAsig: materia.codMateria,
                  codTerm: termId,
                  nroSeccion: sec,
                  dia,
                  hora,
                  semestre: materia.semestre,
                  isManual: false,
                  laboratorio: tipo === 'Laboratorio' && laboratorioId ? { id: laboratorioId, name: '' } : undefined
                })
                faltantes--
              }
            }
          }

          if (faltantes === 0) {
            nuevasTuplasSeccion = nuevasTuplasSeccion.concat(tuplasTemporales)
            return true
          }
          return false
        }

        const asignarBloques = (horasNecesarias: number, tipo: 'Laboratorio' | 'Teoría/Práctica') => {
          let exito = intentarAsignar(horasNecesarias, tipo, true)
          if (!exito) {
            exito = intentarAsignar(horasNecesarias, tipo, false)
          }

          if (!exito) {
            if (tipo === 'Laboratorio' && laboratorioId) {
              throw new Error(`El laboratorio asignado a ${materia.nombre} (Sección ${convertirARomano(sec)}) no tiene disponibilidad o presenta cruces.`)
            }
            const cedulaProf = tipo === 'Laboratorio' ? cedulaProfesorLab : cedulaProfesorTeoria
            if (cedulaProf) {
              throw new Error(`El profesor asignado a ${materia.nombre} (Sección ${convertirARomano(sec)}) no tiene disponibilidad o presenta cruces para completar sus horas de ${tipo}.`)
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
          // Acumular si tuvo éxito
          tuplasEnProceso = [...tuplasEnProceso, ...nuevasTuplasSeccion]
        } catch (e) {
          advertencias.push(e instanceof Error ? e.message : `No se pudo asignar ${materia.nombre} (Sección ${convertirARomano(sec)})`)
        }
      }
    }

    return {
      horarioActualizado: tuplasEnProceso,
      errores,
      advertencias
    }
  }
}
