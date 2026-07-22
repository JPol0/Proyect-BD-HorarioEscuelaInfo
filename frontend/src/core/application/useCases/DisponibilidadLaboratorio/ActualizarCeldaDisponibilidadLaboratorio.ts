import type { DiaSemana } from '../../../domain/DisponibilidadHoraria'
import type { DisponibilidadLaboratorio } from '../../../domain/DisponibilidadLaboratorio'

export class ActualizarCeldaDisponibilidadLaboratorio {
  execute (grilla: DisponibilidadLaboratorio[], dia: DiaSemana, hora: string): DisponibilidadLaboratorio[] {
    return grilla.map((celda) => {
      if (celda.dia !== dia || celda.hora !== hora) {
        return celda
      }

      return {
        ...celda,
        ocupado: !celda.ocupado
      }
    })
  }
}
