import { type Term } from '../../domain/Term'

export interface CreateTermInput {
  id: string
  descripcion: string
  startDate: string
  endDate: string
}

export interface TermRepository {
  getTerms: () => Promise<Term[]>
  createTerm: (input: CreateTermInput) => Promise<Term>
  toggleArchive: (id: string, archived: boolean) => Promise<void>
  deleteTerm: (id: string) => Promise<void>
}
