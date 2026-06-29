import type { Profesor } from '../../domain/Profesor'
import type { ProfesorRepository } from '../../application/ports/ProfesorRepository'
import { profesoresMock } from './mockProfesores'

export class MockProfesorRepository implements ProfesorRepository {
  async obtenerPorCedula (cedula: string): Promise<Profesor | null> {
    return profesoresMock.find((profesor) => profesor.cedula === cedula) ?? null
  }
}
