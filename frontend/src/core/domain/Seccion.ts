import type { Profesor } from './Profesor'

export interface Seccion {
  nroSeccion: number
  codMateria: string
  codTerm: string
  profesorAsignado?: Profesor | null
}
