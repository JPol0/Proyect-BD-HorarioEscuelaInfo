import type { Profesor } from '../../domain/Profesor.js'
import type { ProfesorRepository } from '../ports/ProfesorRepository.js'

export class ObtenerProfesorActivo {
  constructor (private readonly profesorRepository: ProfesorRepository) {}

  async execute (cedula: string): Promise<Profesor> {
    const profesor = await this.profesorRepository.obtenerPorCedula(cedula)

    if (profesor == null) {
      throw new Error(`Profesor no encontrado: ${cedula}`)
    }

    return profesor
  }
}
