import { type Profesor } from './Profesor.js'

export interface Seccion {
  nroSeccion?: number
  codMateria: string
  codTerm: string
  profesorAsignado?: Profesor | null
}
