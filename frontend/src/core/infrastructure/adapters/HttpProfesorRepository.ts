import type { Profesor } from '../../domain/Profesor'
import type { ProfesorRepository } from '../../application/ports/ProfesorRepository'
import { API_CONFIG } from '../config/api'

export class HttpProfesorRepository implements ProfesorRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/profesores`

  async getProfesores (): Promise<Profesor[]> {
    const response = await fetch(this.apiUrl)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor')
    }
    return await response.json() as Profesor[]
  }
}
