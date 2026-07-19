import { type Imparte } from '../../domain/Imparte'

export interface RImparteRepository {
  getAll: (term: string) => Promise<Imparte[]>
  getByMateria: (term: string, codAsig: string) => Promise<Imparte[]>
  save: (imparte: Imparte, term: string) => Promise<void>
  delete: (cedulaP: string, codAsig: string, term: string, nroSeccion: number) => Promise<void>
}
