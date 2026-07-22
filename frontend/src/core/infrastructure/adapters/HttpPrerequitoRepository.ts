import { type PrerequitoRepository } from '../../application/ports/PrerequitoRepository'
import { type Prerequito } from '../../domain/Prerequito'
import { API_CONFIG } from '../config/api'

export class HttpPrerequitoRepository implements PrerequitoRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/prerequitos`

  async obtenerPorTerm (term: string): Promise<Prerequito[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar los prerrequisitos del servidor')
    }
    const raw = await response.json() as any[]
    return raw.map(r => ({
      codigoAsignatura: r.codigoAsignatura,
      codigoAsignaturaPrerequito: r.codigoAsignaturaPrerequito
    }))
  }

  async obtenerPorMateria (codigoAsignatura: string, term: string): Promise<Prerequito[]> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}&materia=${encodeURIComponent(codigoAsignatura)}`)
    if (!response.ok) {
      throw new Error('Error al recuperar los prerrequisitos de la materia del servidor')
    }
    const raw = await response.json() as any[]
    return raw.map(r => ({
      codigoAsignatura: r.codigoAsignatura,
      codigoAsignaturaPrerequito: r.codigoAsignaturaPrerequito
    }))
  }

  async guardar (prerequito: Prerequito, term: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        codigoAsignatura: prerequito.codigoAsignatura,
        codigoTermAsignatura: term,
        codigoAsignaturaPrerequito: prerequito.codigoAsignaturaPrerequito,
        codigoTermPrerequito: term
      })
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al guardar el prerrequisito en el servidor')
    }
  }

  async eliminar (
    codigoAsignatura: string,
    codigoAsignaturaPrerequito: string,
    term: string
  ): Promise<void> {
    const response = await fetch(`${this.apiUrl}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        codigoAsignatura,
        codigoTermAsignatura: term,
        codigoAsignaturaPrerequito,
        codigoTermPrerequito: term
      })
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al eliminar el prerrequisito en el servidor')
    }
  }
}
