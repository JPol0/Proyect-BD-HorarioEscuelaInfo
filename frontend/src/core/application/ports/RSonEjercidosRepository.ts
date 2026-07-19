import { type SonEjercidos } from '../../domain/SonEjercidos'

export interface RSonEjercidosRepository {
  getAll: (term: string) => Promise<SonEjercidos[]>
  getByMateria: (term: string, codAsig: string) => Promise<SonEjercidos[]>
  save: (sonEjercidos: SonEjercidos, term: string) => Promise<void>
  delete: (codLab: number, codAsig: string, term: string) => Promise<void>
}
