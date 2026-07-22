import { type Term } from '../../../domain/Term.js'
import { type TermRepository } from '../../ports/TermRepository.js'

interface CreateTermInput {
  id: string
  descripcion: string
  startDate: string
  endDate: string
}

export class CreateTerm {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (input: CreateTermInput): Promise<Term> {
    if (input.id === '' || !/^\d{4}-\d{2}$/.test(input.id)) {
      throw new Error('El código del período debe tener el formato YYYY-XX (Ej. 2026-25)')
    }
    if (input.descripcion.trim() === '') {
      throw new Error('La descripción del semestre no puede estar vacía')
    }
    if (input.startDate >= input.endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
    }

    const term: Term = {
      id: input.id.trim(),
      descripcion: input.descripcion.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      archived: false
    }

    await this.repository.createTerm(term)
    return term
  }
}
