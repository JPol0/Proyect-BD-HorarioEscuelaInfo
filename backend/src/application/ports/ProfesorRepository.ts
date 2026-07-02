import type { Profesor } from '../../domain/Profesor.js'

export interface ProfesorRepository {
  obtenerPorCedula: (cedula: string) => Promise<Profesor | null>
}
