import { type Term } from '../../domain/Term.js'

export interface TermRepository {
  getTerms: () => Promise<Term[]>
  createTerm: (term: Term) => Promise<void>
  toggleArchive: (id: string, archived: boolean) => Promise<void>
}
