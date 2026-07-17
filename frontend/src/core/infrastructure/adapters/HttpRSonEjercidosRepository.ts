import { type RSonEjercidosRepository } from '../../application/ports/RSonEjercidosRepository'
import { type SonEjercidos } from '../../domain/SonEjercidos'
import { API_CONFIG } from '../config/api'

export class HttpRSonEjercidosRepository implements RSonEjercidosRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/relacion-son-ejercidos`

  async getAll (term: string): Promise<SonEjercidos[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar las relaciones de laboratorios del servidor')
    }
    return await response.json() as SonEjercidos[]
  }

  async getByMateria (term: string, codAsig: string): Promise<SonEjercidos[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}&codAsig=${encodeURIComponent(codAsig)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar las relaciones por materia del servidor')
    }
    return await response.json() as SonEjercidos[]
  }

  async save (sonEjercidos: SonEjercidos): Promise<void> {
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sonEjercidos)
    })

    if (!response.ok) {
      let errorMessage = 'Error al guardar la relación en el servidor'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {}
      throw new Error(errorMessage)
    }
  }

  async delete (codLab: number, codAsig: string, term: string): Promise<void> {
    const query = new URLSearchParams({
      codLab: String(codLab),
      codAsig,
      term
    }).toString()

    const response = await fetch(`${this.apiUrl}?${query}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      let errorMessage = 'Error al eliminar la relación del servidor'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {}
      throw new Error(errorMessage)
    }
  }
}
