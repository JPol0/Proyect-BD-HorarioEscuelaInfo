import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria'
import type { DisponibilidadRepository } from '../../application/ports/DisponibilidadRepository'
import { disponibilidadMock } from './mockDisponibilidad'

/**
 * Repositorio en memoria. Mantiene un mapa por clave `cedula|codTerm` que
 * permite almacenar y recuperar la disponibilidad por profesor y término.
 */
export class MockDisponibilidadRepository implements DisponibilidadRepository {
  private readonly almacen = new Map<string, DisponibilidadHoraria[]>()

  async obtenerPorProfesorYTerm (cedulaProfesor: string, codTerm: string): Promise<DisponibilidadHoraria[]> {
    const clave = `${cedulaProfesor}|${codTerm}`
    const existente = this.almacen.get(clave)

    if (existente != null) {
      return existente
    }

    const registrosBase = disponibilidadMock.filter(
      (registro) => registro.cedulaProfesor === cedulaProfesor && registro.codTerm === codTerm
    )

    return registrosBase
  }

  async guardar (cedulaProfesor: string, codTerm: string, disponibilidad: DisponibilidadHoraria[]): Promise<void> {
    const clave = `${cedulaProfesor}|${codTerm}`
    this.almacen.set(clave, disponibilidad)
  }
}
