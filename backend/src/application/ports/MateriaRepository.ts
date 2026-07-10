import { type Materia } from '../../domain/Materia.js'

export interface MateriaRepository {
  getAll: (term: string) => Promise<Materia[]>
  save: (term: string, materia: Materia) => Promise<void>
  delete: (term: string, codMateria: string) => Promise<void>
  saveBatchGlobal: (materias: Materia[], prereqs: Array<{ codMateria: string, prereqNombres: string[] }>) => Promise<void>
}
