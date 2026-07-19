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
  tuplasTemporales: Horario[]
): boolean {
  const diasAleatorios = [...diasPermitidos].sort(() => Math.random() - 0.5)
  let horasRestantes = faltantes

  for (const dia of diasAleatorios) {
    if (horasRestantes <= 0) break

    // Regla: Bloque único diario para esta sección
    const tieneHorasHoy = nuevasTuplasSeccion.some((t) => t.dia === dia) || tuplasTemporales.some((t) => t.dia === dia)
    if (tieneHorasHoy) continue

    const maxPosiblesHoy = Math.min(horasRestantes, maxHorasPorDia)
    let bloqueActual: Array<{ hora: string, labId?: number }> = []
    const bloquesLibres: Array<Array<{ hora: string, labId?: number }>> = []

    for (const hora of HORAS_DISPONIBLES_BASE) {
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
      const horasAAsignar = mejorBloque.slice(0, Math.min(mejorBloque.length, maxPosiblesHoy))

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

  return horasRestantes === 0
}
