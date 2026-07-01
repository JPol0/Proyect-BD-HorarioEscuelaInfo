import { type Materia } from '../../domain/Materia'

export interface MateriaRepository {
  getMaterias: () => Promise<Materia[]>
  saveMateria: (materia: Materia) => Promise<void>
  deleteMateria: (codMateria: string) => Promise<void>
}
