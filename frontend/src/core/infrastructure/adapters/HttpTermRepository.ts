import { type TermRepository, type CreateTermInput } from '../../application/ports/TermRepository'
import { type Term } from '../../domain/Term'

export class HttpTermRepository implements TermRepository {
  private readonly apiUrl = 'http://localhost:3000/api/terms'

  async getTerms (): Promise<Term[]> {
    const response = await fetch(this.apiUrl)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de horarios')
    }
    return await response.json() as Term[]
  }

  async createTerm (input: CreateTermInput): Promise<Term> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
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
}
