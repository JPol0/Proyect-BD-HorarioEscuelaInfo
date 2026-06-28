import type { DiaSemana, DisponibilidadHoraria, NivelDisponibilidad } from '../../domain/DisponibilidadHoraria'

const SIGUIENTE_NIVEL: Record<NivelDisponibilidad, NivelDisponibilidad> = {
  0: 1,
  1: 2,
  2: 0
}

/**
 * Ciclo de edición de una celda de disponibilidad: 0 (sin disponibilidad)
 * -> 1 (preferencia óptima) -> 2 (disponibilidad secundaria) -> 0...
 * Las celdas marcadas como `ocupado` no son editables y se devuelven sin cambios.
 */
export class ActualizarCeldaDisponibilidad {
  execute (grilla: DisponibilidadHoraria[], dia: DiaSemana, numeroModulo: number): DisponibilidadHoraria[] {
    return grilla.map((celda) => {
      if (celda.dia !== dia || celda.numeroModulo !== numeroModulo || celda.ocupado) {
        return celda
      }

      return {
        ...celda,
        disponibilidad: SIGUIENTE_NIVEL[celda.disponibilidad]
      }
    })
  }
}
