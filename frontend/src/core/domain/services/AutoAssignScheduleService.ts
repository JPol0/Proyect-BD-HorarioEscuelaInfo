import { type Materia } from '../Materia'
import { type Horario, type DaysOfWeek } from '../Horario'
import { type DisponibilidadHoraria, MODULOS_HORARIO } from '../DisponibilidadHoraria'

export const autoAsignarMateria = (
  materia: Materia,
  horarioActual: Horario[],
  seccion: number = 1,
  laboratorioId?: number,
  cedulaProfesor?: string,
  disponibilidad?: DisponibilidadHoraria[],
  profesoresAsignados?: Record<string, Record<number, string>>
): Horario[] => {
  const horasTeoPrac = materia.horasTeo + materia.horasPrac
  const totalHoras = horasTeoPrac + materia.horasLab
  if (totalHoras === 0) return horarioActual

  const maxHorasPorDia = totalHoras === 6 ? 2 : 3

  const horarioSinEstaMateria = horarioActual.filter(
    (t) => !(t.codAsig === materia.codMateria && t.nroSeccion === seccion)
  )

  const diasSemanasBase: DaysOfWeek[] = materia.modalidad === 'VIT'
    ? ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
    : ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  const diasSemanas = [...diasSemanasBase].sort(() => Math.random() - 0.5)

  const horasDisponiblesBase = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00'
  ]

  let nuevasTuplas: Horario[] = []

  const intentarAsignar = (horasNecesarias: number, tipo: string, soloPrioridad1: boolean): boolean => {
    let faltantes = horasNecesarias
    const tuplasTemporales: Horario[] = []

    for (const dia of diasSemanas) {
      if (faltantes <= 0) break

      const tieneHorasHoy = nuevasTuplas.some((t) => t.dia === dia) || tuplasTemporales.some((t) => t.dia === dia)
      if (tieneHorasHoy) continue

      const maxPosiblesHoy = Math.min(faltantes, maxHorasPorDia)

      let bloqueActual: string[] = []
      const bloquesLibres: string[][] = []

      for (const hora of horasDisponiblesBase) {
        // 1. Choca con misma materia semestre
        let estaOcupado = horarioSinEstaMateria.some((t) => t.dia === dia && t.hora === hora && t.semestre === materia.semestre)

        // 2. Choca profesor
        if (!estaOcupado && cedulaProfesor && profesoresAsignados) {
          estaOcupado = horarioSinEstaMateria.some((t) => {
            if (t.dia !== dia || t.hora !== hora) return false
            return profesoresAsignados[t.codAsig]?.[t.nroSeccion] === cedulaProfesor
          })
        }

        // 3. Choca Laboratorio
        if (!estaOcupado && tipo === 'Laboratorio' && laboratorioId) {
          estaOcupado = horarioSinEstaMateria.some((t) =>
            t.dia === dia &&
            t.hora === hora &&
            t.laboratorio?.id === laboratorioId
          )
        }

        // 4. Disponibilidad profesor
        let nivelDispo = 1
        if (!estaOcupado && disponibilidad && disponibilidad.length > 0) {
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
            nroSeccion: seccion,
            dia,
            hora,
            semestre: materia.semestre,
            laboratorio: tipo === 'Laboratorio' && laboratorioId ? { id: laboratorioId, name: '' } : undefined
          })
          faltantes--
        }
      }
    }

    if (faltantes === 0) {
      nuevasTuplas = nuevasTuplas.concat(tuplasTemporales)
      return true
    }
    return false
  }

  const asignarBloques = (horasNecesarias: number, tipo: string) => {
    // Intento 1: Solo con disponibilidad 1
    let exito = intentarAsignar(horasNecesarias, tipo, true)

    // Intento 2: Fallback aceptando disponibilidad 1 y 2
    if (!exito) {
      exito = intentarAsignar(horasNecesarias, tipo, false)
    }

    if (!exito) {
      if (tipo === 'Laboratorio') {
        if (laboratorioId !== undefined) {
          throw new Error(`El laboratorio asignado a ${materia.nombre} no tiene disponibilidad de horas o la sección presenta choques de horarios con otras materias.`)
        } else {
          throw new Error(`El profesor asignado a ${materia.nombre} no tiene disponibilidad de horas o la sección presenta choques de horarios con otras materias.`)
        }
      } else {
        throw new Error(`No hay suficiente espacio en el horario para asignar todas las horas de ${tipo} de ${materia.nombre}. Considera las disponibilidades y cruces.`)
      }
    }
  }

  if (materia.horasLab > 0) {
    asignarBloques(materia.horasLab, 'Laboratorio')
  }

  if (horasTeoPrac > 0) {
    asignarBloques(horasTeoPrac, 'Teoría/Práctica')
  }

  return [...horarioSinEstaMateria, ...nuevasTuplas]
}
