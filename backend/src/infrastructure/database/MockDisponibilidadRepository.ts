import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria.js'
import type { DisponibilidadRepository } from '../../application/ports/DisponibilidadRepository.js'
import { mockDisponibilidad } from './mockDisponibilidad.js'

export class MockDisponibilidadRepository implements DisponibilidadRepository {
  private readonly almacen = new Map<string, DisponibilidadHoraria[]>()

  async obtenerPorProfesorYTerm (cedulaProfesor: string, codTerm: string): Promise<DisponibilidadHoraria[]> {
    const clave = `${cedulaProfesor}|${codTerm}`
    const existente = this.almacen.get(clave)

    if (existente != null) {
      return existente
    }

    return mockDisponibilidad.filter(
      (registro) => registro.cedulaProfesor === cedulaProfesor && registro.codTerm === codTerm
    )
  }

  async guardar (cedulaProfesor: string, codTerm: string, disponibilidad: DisponibilidadHoraria[]): Promise<void> {
    const clave = `${cedulaProfesor}|${codTerm}`
    this.almacen.set(clave, disponibilidad)
  }
}