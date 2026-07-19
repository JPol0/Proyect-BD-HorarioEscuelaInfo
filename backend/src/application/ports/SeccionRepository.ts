import { type Seccion } from '../../domain/Seccion.js'

export interface SeccionRepository {
  getSecciones: (codTerm: string, codMateria: string) => Promise<Seccion[]>
  getSeccion: (codTerm: string, codMateria: string, nroSeccion: number) => Promise<Seccion | null>
  saveSeccion: (seccion: Seccion, tx?: any) => Promise<void>
  deleteSeccion: (codTerm: string, codMateria: string, nroSeccion: number) => Promise<void>
}
