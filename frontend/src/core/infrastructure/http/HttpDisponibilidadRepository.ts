import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria'
import type { Profesor } from '../../domain/Profesor'
import type { DisponibilidadRepository } from '../../application/ports/DisponibilidadRepository'
import { ApiClient } from './ApiClient'

interface DisponibilidadResponse {
  profesor: Profesor
  disponibilidad: DisponibilidadHoraria[]
}

export class HttpDisponibilidadRepository implements DisponibilidadRepository {
  constructor (private readonly apiClient: ApiClient) {}

  async obtenerPorProfesorYTerm (cedulaProfesor: string, codTerm: string): Promise<DisponibilidadHoraria[]> {
    const response = await this.apiClient.get<DisponibilidadResponse>(`/profesores/${cedulaProfesor}/disponibilidad?term=${codTerm}`)
    return response.disponibilidad
  }

  async guardar (cedulaProfesor: string, codTerm: string, disponibilidad: DisponibilidadHoraria[]): Promise<void> {
    await this.apiClient.put(`/profesores/${cedulaProfesor}/disponibilidad?term=${codTerm}`, disponibilidad)
  }
}
