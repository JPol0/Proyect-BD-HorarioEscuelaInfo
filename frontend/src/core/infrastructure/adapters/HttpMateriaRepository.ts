import { type MateriaRepository } from '../../application/ports/MateriaRepository'
import { type Materia } from '../../domain/Materia'
import { API_CONFIG } from '../config/api'

export class HttpMateriaRepository implements MateriaRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/materias`

  async getMaterias (term: string): Promise<Materia[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar las materias del servidor')
    }
    return await response.json()
  }

  async saveMateria (term: string, materia: Materia): Promise<void> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}`, {
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

  async deleteMateria (term: string, codMateria: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${encodeURIComponent(codMateria)}?term=${encodeURIComponent(term)}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      let errorMessage = 'Error al eliminar la materia del servidor'

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

  async uploadPlanEstudioExcel (file: File, term: string): Promise<{ count: number, skipped: number }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.apiUrl}/upload-excel?term=${encodeURIComponent(term)}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      let errorMessage = 'Error al cargar el plan de estudios desde Excel'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {
        // Usar mensaje por defecto
      }
      throw new Error(errorMessage)
    }

    return await response.json() as { count: number, skipped: number }
  }
}
