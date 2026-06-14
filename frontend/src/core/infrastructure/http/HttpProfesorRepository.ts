import type { Profesor } from '../../domain/Profesor'
import type { ProfesorRepository } from '../../application/ports/ProfesorRepository'
import { ApiClient } from './ApiClient'

interface DisponibilidadResponse {
  profesor: Profesor
  disponibilidad: unknown[]
}

/**
 * El endpoint actual no expone GET /profesores/:cedula de forma aislada;
 * por eso se reutiliza el endpoint de disponibilidad para obtener el profesor.
 */
export class HttpProfesorRepository implements ProfesorRepository {
  constructor (private readonly apiClient: ApiClient, private readonly codTermPorDefecto: string) {}

  async obtenerPorCedula (cedula: string): Promise<Profesor> {
    const response = await this.apiClient.get<DisponibilidadResponse>(`/profesores/${cedula}/disponibilidad?term=${this.codTermPorDefecto}`)
    return response.profesor
  }
}
