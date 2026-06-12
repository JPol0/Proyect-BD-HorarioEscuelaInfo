import { type Term } from '../../domain/Term'

export interface CreateTermInput {
  name: string
  startDate: string
  endDate: string
}

export interface TermRepository {
  getTerms: () => Promise<Term[]>
  createTerm: (input: CreateTermInput) => Promise<Term>
  toggleArchive: (id: string, archived: boolean) => Promise<void>
}
