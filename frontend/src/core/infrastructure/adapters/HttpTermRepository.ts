import { type TermRepository, type CreateTermInput } from '../../application/ports/TermRepository'
import { type Term } from '../../domain/Term'
import { API_CONFIG } from '../config/api'

export class HttpTermRepository implements TermRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/terms`

  async getTerms (): Promise<Term[]> {
    const response = await fetch(this.apiUrl, { credentials: 'include' })
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de horarios')
    }
    return await response.json() as Term[]
  }

  async createTerm (input: CreateTermInput): Promise<Term> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al crear el término')
    }

    return await response.json() as Term
  }

  async toggleArchive (id: string, archived: boolean): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}/archive`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ archived })
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al procesar la solicitud en el servidor')
    }
  }

  async deleteTerm (id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      let errorMessage = 'Error al eliminar el término'
      try {
        const errorData = await response.json() as { error?: string }
        if (errorData.error !== undefined && errorData.error !== '') {
          errorMessage = errorData.error
        }
      } catch { }
      throw new Error(errorMessage)
    }
  }
}

