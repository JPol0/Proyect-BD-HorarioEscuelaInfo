import { type Horario, type DaysOfWeek } from '../../../../domain/Horario'
import { verificarChoquesYDisponibilidad, type ContextoChoques } from './VerificadorChoques'
import { HORAS_DISPONIBLES_BASE } from './ValidarAsignacionesPrevias'

export function intentarAsignarBloque (
  faltantes: number,
  sec: number,
  tipo: 'Laboratorio' | 'Teoría/Práctica',
  maxHorasPorDia: number,
  diasPermitidos: DaysOfWeek[],
  ctxBase: Omit<ContextoChoques, 'dia' | 'hora'>,
  nuevasTuplasSeccion: Horario[],
  tuplasTemporales: Horario[],
  permitirDivision3Horas: boolean = false
): boolean {
  const diasAleatorios = [...diasPermitidos].sort(() => Math.random() - 0.5)
  let horasRestantes = faltantes

  const diasIndex: Record<string, number> = { Lunes: 0, Martes: 1, Miercoles: 2, Jueves: 3, Viernes: 4, Sabado: 5, Domingo: 6 }

  const procesarDias = (skipAdjacent: boolean) => {
    for (const dia of diasAleatorios) {
      if (horasRestantes <= 0) break

      // Regla: Bloque único diario para esta sección
      const tieneHorasHoy = nuevasTuplasSeccion.some((t) => t.dia === dia) || tuplasTemporales.some((t) => t.dia === dia)
      if (tieneHorasHoy) continue

      if (skipAdjacent) {
        const dIdx = diasIndex[dia]
        const isAdjacent = nuevasTuplasSeccion.some(t => Math.abs(diasIndex[t.dia] - dIdx) === 1) ||
                           tuplasTemporales.some(t => Math.abs(diasIndex[t.dia] - dIdx) === 1)
        if (isAdjacent) continue
      }

      const maxPosiblesHoy = Math.min(horasRestantes, maxHorasPorDia)
      let bloqueActual: Array<{ hora: string, labId?: number }> = []
      const bloquesLibres: Array<Array<{ hora: string, labId?: number }>> = []

      for (const hora of HORAS_DISPONIBLES_BASE) {
        // Regla: Materias presenciales (PRE) no pueden darse más allá de las 18:00 (último bloque permitido es 18:00)
        if (ctxBase.materia.modalidad === 'PRE' && parseInt(hora.split(':')[0], 10) > 18) {
          continue
        }

        const ctx: ContextoChoques = {
          ...ctxBase,
          dia,
          hora,
          tuplasActualesYTemporales: [...ctxBase.tuplasActualesYTemporales, ...nuevasTuplasSeccion, ...tuplasTemporales]
        }

        const { estaOcupado, labAAsignar } = verificarChoquesYDisponibilidad(ctx)

        if (!estaOcupado) {
          bloqueActual.push({ hora, labId: labAAsignar })
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

        // Validación estricta de tamaño de bloque
        if (horasRestantes >= 2 && mejorBloque.length < 2) {
          continue // Saltamos este día porque solo ofrece bloques de 1 hora, y necesitamos al menos 2 juntas.
        }

        const cantidadAAsignar = Math.min(mejorBloque.length, maxPosiblesHoy)

        // Si nos faltan 3 horas (ya sea porque la materia es de 3h, o el resto de una de 5h), ESTÁ PROHIBIDO tomar un bloque de 2.
        // Debe ser obligatoriamente un bloque de 3 para evitar dejar 1 hora aislada.
        if (horasRestantes === 3 && cantidadAAsignar < 3 && !permitirDivision3Horas) {
          continue // Saltamos este día hasta encontrar un bloque de 3
        }

        const horasAAsignar = mejorBloque.slice(0, cantidadAAsignar)

        for (const { hora, labId } of horasAAsignar) {
          tuplasTemporales.push({
            codAsig: ctxBase.materia.codMateria,
            nroSeccion: sec,
            dia,
            hora,
            semestre: ctxBase.materia.semestre,
            isManual: false,
            laboratorio: tipo === 'Laboratorio' && labId ? { id: labId, name: '' } : undefined
          })
          horasRestantes--
        }
      }
    }
  }

  // Primera pasada: intentar asignar con un día de por medio
  procesarDias(true)

  // Segunda pasada: si faltan horas, flexibilizar y permitir días consecutivos
  if (horasRestantes > 0) {
    procesarDias(false)
  }

  return horasRestantes === 0
}
