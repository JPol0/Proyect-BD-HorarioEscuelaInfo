import type { Profesor } from '../../../domain/Profesor.js'
import type { ProfesorRepository } from '../../ports/ProfesorRepository.js'

export class CrearProfesor {
  constructor (private readonly repository: ProfesorRepository) {}

  async execute (datos: Profesor): Promise<Profesor> {
    if (datos.cedula.trim() === '') throw new Error('La cédula es obligatoria')
    if (datos.nombre.trim() === '') throw new Error('El nombre es obligatorio')
    if (datos.correo.trim() === '') throw new Error('El correo es obligatorio')
    return await this.repository.crear(datos)
  }
}
