import { type Seccion } from '../../domain/Seccion.js'

export interface SeccionRepository {
  getSecciones: (codTerm: string, codMateria: string, tx?: any) => Promise<Seccion[]>
  getSeccion: (codTerm: string, codMateria: string, nroSeccion: number, tx?: any) => Promise<Seccion | null>
  saveSeccion: (seccion: Seccion, tx?: any) => Promise<void>
  deleteSeccion: (codTerm: string, codMateria: string, nroSeccion: number, tx?: any) => Promise<void>
}

