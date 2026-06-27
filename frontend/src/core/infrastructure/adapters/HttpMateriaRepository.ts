import { type MateriaRepository } from '../../application/ports/MateriaRepository'
import { type Materia } from '../../domain/Materia'
import { API_CONFIG } from '../config/api'

export class HttpMateriaRepository implements MateriaRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/materias`

  async getMaterias (): Promise<Materia[]> {
    const response = await fetch(this.apiUrl)
    if (!response.ok) {
      throw new Error('Error al recuperar las materias del servidor')
    }
    return await response.json()
  }

  async saveMateria (materia: Materia): Promise<void> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(materia)
    })

    if (!response.ok) {
      let errorMessage = 'Error al guardar la materia en el servidor'

      try {
        const errorData = await response.json() as Record<string, unknown>

        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {
        // Si el servidor no devolvió un JSON válido, nos quedamos con el mensaje por defecto
      }

      throw new Error(errorMessage)
    }
  }
}
