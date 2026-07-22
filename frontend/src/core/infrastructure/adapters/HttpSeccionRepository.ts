import { type SeccionRepository } from '../../application/ports/SeccionRepository'
import { type Seccion } from '../../domain/Seccion'
import { API_CONFIG } from '../config/api'

export class HttpSeccionRepository implements SeccionRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/secciones`

  async getSecciones (codTerm: string, codMateria: string): Promise<Seccion[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(codTerm)}&materia=${encodeURIComponent(codMateria)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar las secciones del servidor')
    }
    const raw = await response.json() as any[]
    return raw.map(r => ({
      nroSeccion: Number(r.nroSeccion),
      codMateria: r.codMateria,
      profesorAsignado: r.profesorAsignado ?? null
    }))
  }

  async getSeccion (codTerm: string, codMateria: string, nroSeccion: number): Promise<Seccion | null> {
    const response = await fetch(`${this.apiUrl}/${encodeURIComponent(nroSeccion)}?term=${encodeURIComponent(codTerm)}&materia=${encodeURIComponent(codMateria)}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Error al recuperar la sección del servidor')
    }
    const r = await response.json()
    return {
      nroSeccion: Number(r.nroSeccion),
      codMateria: r.codMateria,
      profesorAsignado: r.profesorAsignado ?? null
    }
  }

  async saveSeccion (seccion: Seccion, term: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...seccion, codTerm: term })
    })

    if (!response.ok) {
      let errorMessage = 'Error al guardar la sección en el servidor'

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

  async deleteSeccion (codTerm: string, codMateria: string, nroSeccion: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${encodeURIComponent(nroSeccion)}?term=${encodeURIComponent(codTerm)}&materia=${encodeURIComponent(codMateria)}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      let errorMessage = 'Error al eliminar la sección en el servidor'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {
      }
      throw new Error(errorMessage)
    }
  }
}
