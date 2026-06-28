import { type TermRepository } from '../../application/ports/TermRepository.js'
import { type Term } from '../../domain/Term.js'

// Datos de mock en memoria — reemplazar por adaptador de BD cuando se implemente
const MOCK_TERMS: Term[] = [
  {
    id: '1',
    name: 'Segundo Semestre 2026',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    archived: true
  },
  {
    id: '2',
    name: 'Primer Semestre 2026',
    startDate: '2026-03-01',
    endDate: '2026-07-31',
    archived: true
  },
  {
    id: '3',
    name: 'Segundo Semestre 2025',
    startDate: '2025-08-01',
    endDate: '2025-12-31',
    archived: true
  },
  {
    id: '4',
    name: 'Primer Semestre 2025',
    startDate: '2025-03-01',
    endDate: '2025-07-31',
    archived: true
  },
  {
    id: '5',
    name: 'Segundo Semestre 2024',
    startDate: '2024-08-01',
    endDate: '2024-12-31',
    archived: true
  }
]

export class MockTermRepository implements TermRepository {
  async getTerms (): Promise<Term[]> {
    return [...MOCK_TERMS]
  }

  async createTerm (term: Term): Promise<void> {
    MOCK_TERMS.unshift(term)
  }

  async toggleArchive (id: string, archived: boolean): Promise<void> {
    const index = MOCK_TERMS.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error('El término solicitado no existe')
    }
    MOCK_TERMS[index].archived = archived
  }
}
