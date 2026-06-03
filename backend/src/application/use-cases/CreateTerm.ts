import { v4 as uuidv4 } from 'uuid'
import type { Term } from '../../domain/entities/Term.js'
import type { TermRepository } from '../../domain/ports/TermRepository.js'

export interface CreateTermInput {
  name: string
  startDate: string
  endDate: string
  materias: number
}

export class CreateTerm {
  constructor (private readonly termRepository: TermRepository) {}

  async execute (input: CreateTermInput): Promise<Term> {
    if (input.name.trim() === '') {
      throw new Error('El nombre del term no puede estar vacío')
    }
    if (input.startDate >= input.endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
    }

    const newTerm: Term = {
      id: uuidv4(),
      name: input.name.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      materias: input.materias ?? 0,
      archived: false
    }

    return await this.termRepository.save(newTerm)
  }
}
