import { type Laboratorio } from '../../domain/Laboratorio.js'

export interface LaboratorioRepository {
  getAll: () => Promise<Laboratorio[]>
  getById: (id: number) => Promise<Laboratorio | null>
  save: (laboratorio: Laboratorio) => Promise<void>
  delete: (id: number) => Promise<void>
}
