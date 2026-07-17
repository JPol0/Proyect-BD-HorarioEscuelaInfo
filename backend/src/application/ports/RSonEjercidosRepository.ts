import { type SonEjercidos } from '../../domain/SonEjercidos.js'

export interface RSonEjercidosRepository {
  getAll: (term: string) => Promise<SonEjercidos[]>
  getByMateria: (term: string, codAsig: string) => Promise<SonEjercidos[]>
  save: (sonEjercidos: SonEjercidos) => Promise<void>
  delete: (codLab: number, codAsig: string, term: string) => Promise<void>
}
