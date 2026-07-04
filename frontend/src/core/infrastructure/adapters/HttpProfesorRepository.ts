import type { Profesor } from '../../domain/Profesor'
import { API_CONFIG } from '../config/api'

export class HttpProfesorRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/profesores`

  async getProfesores (): Promise<Profesor[]> {
    const response = await fetch(this.apiUrl)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor')
    }
    return await response.json() as Profesor[]
  }
}
