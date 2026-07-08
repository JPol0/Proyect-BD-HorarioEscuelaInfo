import type { Profesor } from '../../domain/Profesor'

export interface ProfesorRepository {
  getProfesores: () => Promise<Profesor[]>
  crearProfesor: (datos: Profesor) => Promise<Profesor>
  actualizarStatus: (cedula: string, status: Profesor['status']) => Promise<Profesor>
}
