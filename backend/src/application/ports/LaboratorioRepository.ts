import { type Laboratorio } from '../../domain/Laboratorio.js'

export interface LaboratorioRepository {
  getAll (): Promise<Laboratorio[]>
  save (laboratorio: Laboratorio): Promise<void>
  delete (id: string): Promise<void>
}
