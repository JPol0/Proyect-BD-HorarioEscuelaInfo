import type { Profesor } from '../../domain/Profesor'

export interface ProfesorRepository {
  obtenerPorCedula: (cedula: string) => Promise<Profesor | null>
}
