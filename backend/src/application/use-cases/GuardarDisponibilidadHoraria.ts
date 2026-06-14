import type { DiaSemana, DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria'
import { DIAS_SEMANA, MODULOS_HORARIO } from '../../domain/DisponibilidadHoraria'
import type { DisponibilidadRepository } from '../ports/DisponibilidadRepository'

const DIAS_VALIDOS = new Set<DiaSemana>(DIAS_SEMANA)
const MODULOS_VALIDOS = new Set<number>(MODULOS_HORARIO.map((modulo) => modulo.numeroModulo))
const NIVELES_VALIDOS = new Set<number>([0, 1, 2])

export class GuardarDisponibilidadHoraria {
  constructor (private readonly disponibilidadRepository: DisponibilidadRepository) {}

  async execute (cedulaProfesor: string, codTerm: string, grilla: DisponibilidadHoraria[]): Promise<void> {
    for (const celda of grilla) {
      if (!DIAS_VALIDOS.has(celda.dia)) {
        throw new Error(`Dia inválido: ${celda.dia}`)
      }

      if (!MODULOS_VALIDOS.has(celda.numeroModulo)) {
        throw new Error(`Módulo inválido: ${celda.numeroModulo}`)
      }

      if (!NIVELES_VALIDOS.has(celda.disponibilidad)) {
        throw new Error(`Nivel inválido: ${celda.disponibilidad}`)
      }
    }

    await this.disponibilidadRepository.guardar(cedulaProfesor, codTerm, grilla)
  }
}
