import { type Profesor } from './Profesor.js'

export interface Seccion {
  numeroSeccion: string
  codMateria: string
  codTerm: string
  profesorAsignado?: Profesor | null
}
