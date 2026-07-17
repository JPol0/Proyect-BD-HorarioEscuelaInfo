import type { Profesor } from '../../domain/Profesor'
import type { ProfesorRepository } from '../../application/ports/ProfesorRepository'
import { API_CONFIG } from '../config/api'

export class HttpProfesorRepository implements ProfesorRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/profesores`

  async getProfesores (): Promise<Profesor[]> {
    const response = await fetch(this.apiUrl, { credentials: 'include' })
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor')
    }
    return await response.json() as Profesor[]
  }

  async crearProfesor (datos: Profesor): Promise<Profesor> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    if (!response.ok) {
      const err = await response.json() as { message?: string }
      throw new Error(err.message ?? 'Error al crear el profesor')
    }
    return await response.json() as Profesor
  }

  async actualizarStatus (cedula: string, status: Profesor['status']): Promise<Profesor> {
    const response = await fetch(`${this.apiUrl}/${cedula}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (!response.ok) {
      const err = await response.json() as { message?: string }
      throw new Error(err.message ?? 'Error al actualizar el status')
    }
    return await response.json() as Profesor
  }
}
