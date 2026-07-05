import { Profesor } from './Profesor'

export interface Seccion {
  numeroSeccion: string
  codMateria: string
  codTerm: string
  profesorAsignado?: Profesor | null
}
