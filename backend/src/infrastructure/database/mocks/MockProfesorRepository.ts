import type { Profesor } from '../../../domain/Profesor.js'
import type { ProfesorRepository } from '../../../application/ports/ProfesorRepository.js'
import { profesoresMock } from './mockProfesores.js'

export class MockProfesorRepository implements ProfesorRepository {
  async obtenerPorCedula (cedula: string): Promise<Profesor | null> {
    return profesoresMock.find((profesor: Profesor) => profesor.cedula === cedula) ?? null
  }
}
