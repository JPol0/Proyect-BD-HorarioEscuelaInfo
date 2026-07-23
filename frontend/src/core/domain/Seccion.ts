import type { Profesor } from './Profesor'

export interface Seccion {
  nroSeccion: number
  codMateria: string
  profesorAsignado?: Profesor | null
}
