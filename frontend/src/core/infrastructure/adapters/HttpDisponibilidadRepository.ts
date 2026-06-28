import type { DisponibilidadRepository } from '../../application/ports/DisponibilidadRepository'
import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria'
import type { Profesor } from '../../domain/Profesor'

interface DisponibilidadResponse {
  profesor: Profesor
  disponibilidad: DisponibilidadHoraria[]
}

const BASE_URL = 'http://localhost:3000/api'

export class HttpDisponibilidadRepository implements DisponibilidadRepository {
  async obtenerPorProfesorYTerm (cedulaProfesor: string, codTerm: string): Promise<DisponibilidadHoraria[]> {
    const response = await fetch(`${BASE_URL}/profesores/${cedulaProfesor}/disponibilidad?term=${codTerm}`)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de horarios')
    }
    const data = await response.json() as DisponibilidadResponse
    return data.disponibilidad
  }

  async obtenerProfesor (cedulaProfesor: string, codTerm: string): Promise<Profesor> {
    const response = await fetch(`${BASE_URL}/profesores/${cedulaProfesor}/disponibilidad?term=${codTerm}`)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de horarios')
    }
    const data = await response.json() as DisponibilidadResponse
    return data.profesor
  }

  async guardar (cedulaProfesor: string, codTerm: string, disponibilidad: DisponibilidadHoraria[]): Promise<void> {
    const response = await fetch(`${BASE_URL}/profesores/${cedulaProfesor}/disponibilidad?term=${codTerm}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(disponibilidad)
    })
    if (!response.ok) {
      const errorData = await response.json() as { message?: string }
      throw new Error(errorData.message ?? 'Error al guardar la disponibilidad')
    }
  }
}
