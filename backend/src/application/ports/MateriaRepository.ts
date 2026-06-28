import { type Materia } from '../../domain/Materia.js'

export interface MateriaRepository {

  getAll: () => Promise<Materia[]>
  save: (materia: Materia) => Promise<void>
}
