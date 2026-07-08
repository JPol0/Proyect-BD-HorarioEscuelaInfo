import { type TermRepository } from '../../../application/ports/TermRepository.js'
import { type Term } from '../../../domain/Term.js'
import { type MockMateriaRepository } from './MockMateriaRepository.js'
import { type MockDisponibilidadRepository } from './MockDisponibilidadRepository.js'
import { type JsonHorarioRepository } from './JsonHorarioRepository.js'

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
  private readonly disponibilidadRepository?: MockDisponibilidadRepository
  private readonly materiaRepository?: MockMateriaRepository
  private readonly horarioRepository?: JsonHorarioRepository

  constructor (
    disponibilidadRepository?: MockDisponibilidadRepository,
    materiaRepository?: MockMateriaRepository,
    horarioRepository?: JsonHorarioRepository
  ) {
    this.disponibilidadRepository = disponibilidadRepository
    this.materiaRepository = materiaRepository
    this.horarioRepository = horarioRepository
  }

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

  async deleteTerm (id: string): Promise<void> {
    const index = MOCK_TERMS.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error('El término solicitado no existe')
    }

    // Borrado en cascada en los repositorios de mock asociados
    if (this.disponibilidadRepository !== undefined) {
      this.disponibilidadRepository.clearTerm(id)
    }
    if (this.materiaRepository !== undefined) {
      this.materiaRepository.clearTerm(id)
    }
    if (this.horarioRepository !== undefined) {
      await this.horarioRepository.clearTerm(id)
    }

    MOCK_TERMS.splice(index, 1)
  }
}
