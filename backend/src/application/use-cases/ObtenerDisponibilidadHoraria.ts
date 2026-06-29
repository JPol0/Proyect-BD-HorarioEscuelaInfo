import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria'
import { DIAS_SEMANA, MODULOS_HORARIO } from '../../domain/DisponibilidadHoraria'
import type { DisponibilidadRepository } from '../ports/DisponibilidadRepository'

export class ObtenerDisponibilidadHoraria {
  constructor (private readonly disponibilidadRepository: DisponibilidadRepository) {}

  async execute (cedulaProfesor: string, codTerm: string): Promise<DisponibilidadHoraria[]> {
    const registros = await this.disponibilidadRepository.obtenerPorProfesorYTerm(cedulaProfesor, codTerm)

    const grillaCompleta: DisponibilidadHoraria[] = []

    for (const dia of DIAS_SEMANA) {
      for (const modulo of MODULOS_HORARIO) {
        const celdaExistente = registros.find(
          (registro) => registro.dia === dia && registro.numeroModulo === modulo.numeroModulo
        )

        if (celdaExistente != null) {
          grillaCompleta.push(celdaExistente)
          continue
        }

        grillaCompleta.push({
          cedulaProfesor,
          codTerm,
          dia,
          numeroModulo: modulo.numeroModulo,
          disponibilidad: 0,
          ocupado: false,
          materiaAsignada: null
        })
      }
    }

    return grillaCompleta
  }
}
