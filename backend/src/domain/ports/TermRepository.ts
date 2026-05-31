import type { Term } from '../entities/Term.js'

export interface TermRepository {
  findAll: () => Promise<Term[]>
  findById: (id: string) => Promise<Term | undefined>
  save: (term: Term) => Promise<Term>
  delete: (id: string) => Promise<void>
}
