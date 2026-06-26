import type { DiaSemana, DisponibilidadHoraria, NivelDisponibilidad } from '../../domain/DisponibilidadHoraria.js'

const SIGUIENTE_NIVEL: Record<NivelDisponibilidad, NivelDisponibilidad> = {
  0: 1,
  1: 2,
  2: 0
}

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
