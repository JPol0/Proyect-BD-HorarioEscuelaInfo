import { type Materia } from '../../domain/Materia'

export interface MateriaRepository {
  getMaterias: (term: string) => Promise<Materia[]>
  saveMateria: (term: string, materia: Materia) => Promise<void>
  deleteMateria: (term: string, codMateria: string) => Promise<void>
}
