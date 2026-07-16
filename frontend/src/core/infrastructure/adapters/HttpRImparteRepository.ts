import { type RImparteRepository } from '../../application/ports/RImparteRepository'
import { type Imparte } from '../../domain/Imparte'
import { API_CONFIG } from '../config/api'

export class HttpRImparteRepository implements RImparteRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/relacion-imparte`

  async getAll (term: string): Promise<Imparte[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar las asignaciones del servidor')
    }
    return await response.json() as Imparte[]
  }

  async getByMateria (term: string, codAsig: string): Promise<Imparte[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}&codAsig=${encodeURIComponent(codAsig)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar las asignaciones por materia del servidor')
    }
    return await response.json() as Imparte[]
  }

  async save (imparte: Imparte): Promise<void> {
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(imparte)
    })

    if (!response.ok) {
      let errorMessage = 'Error al guardar la asignación en el servidor'

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

  async delete (cedulaP: string, codAsig: string, term: string, nroSeccion: number): Promise<void> {
    const query = new URLSearchParams({
      cedulaP,
      codAsig,
      term,
      nroSeccion: String(nroSeccion)
    }).toString()

    const response = await fetch(`${this.apiUrl}?${query}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      let errorMessage = 'Error al eliminar la asignación del servidor'

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
