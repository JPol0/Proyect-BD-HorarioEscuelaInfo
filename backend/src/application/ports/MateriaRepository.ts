import { type Materia } from '../../domain/Materia.js'

export interface MateriaRepository {
  getAll: (term: string) => Promise<Materia[]>
  getById: (term: string, codMateria: string, tx?: any) => Promise<Materia | null>
  save: (term: string, materia: Materia, tx?: any) => Promise<void>
  delete: (term: string, codMateria: string) => Promise<void>
  deleteByTerm: (term: string, tx?: any) => Promise<void>
}
