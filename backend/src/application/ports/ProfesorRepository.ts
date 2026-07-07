import type { Profesor } from '../../domain/Profesor.js'

export interface ProfesorRepository {
  obtenerPorCedula: (cedula: string) => Promise<Profesor | null>
  obtenerTodos: () => Promise<Profesor[]>
  crear: (profesor: Profesor) => Promise<Profesor>
  actualizarStatus: (cedula: string, status: Profesor['status']) => Promise<Profesor>
}
