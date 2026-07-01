import { type Term } from '../../../domain/Term.js'
import { type TermRepository } from '../../ports/TermRepository.js'

interface CreateTermInput {
  name: string
  startDate: string
  endDate: string
}

export class CreateTerm {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (input: CreateTermInput): Promise<Term> {
    if (input.name.trim() === '') {
      throw new Error('El nombre del término no puede estar vacío')
    }
    if (input.startDate >= input.endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
    }

    const term: Term = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      archived: false
    }

    await this.repository.createTerm(term)
    return term
  }
}
