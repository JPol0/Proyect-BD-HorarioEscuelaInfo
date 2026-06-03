import type { Term } from '../entities/Term'

export interface CreateTermInput {
  name: string
  startDate: string
  endDate: string
  materias: number
}

export interface TermRepository {
  getAll: () => Promise<Term[]>
  create: (input: CreateTermInput) => Promise<Term>
}
