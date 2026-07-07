import type { Seccion } from '../../domain/Seccion'

export interface SeccionRepository {
  getSecciones: (codTerm: string, codMateria: string) => Promise<Seccion[]>
  getSeccion: (codTerm: string, codMateria: string, nroSeccion: number) => Promise<Seccion | null>
  saveSeccion: (seccion: Seccion) => Promise<void>
}
