import type { Term } from '../../domain/entities/Term'
import type { CreateTermInput, TermRepository } from '../../domain/ports/TermRepository.port'

const API_BASE = 'http://localhost:3000/api'

export class HttpTermRepository implements TermRepository {
  async getAll (): Promise<Term[]> {
    const res = await fetch(`${API_BASE}/terms`)
    if (!res.ok) throw new Error('Error al obtener los terms')
    return res.json() as Promise<Term[]>
  }

  async create (input: CreateTermInput): Promise<Term> {
    const res = await fetch(`${API_BASE}/terms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error((err as { message: string }).message)
    }
    return res.json() as Promise<Term>
  }
}
