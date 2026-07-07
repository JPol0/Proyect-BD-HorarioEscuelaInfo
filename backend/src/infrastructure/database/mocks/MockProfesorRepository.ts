import type { Profesor } from '../../../domain/Profesor.js'
import type { ProfesorRepository } from '../../../application/ports/ProfesorRepository.js'
import { profesoresMock } from './mockProfesores.js'

const datos: Profesor[] = [...profesoresMock]

export class MockProfesorRepository implements ProfesorRepository {
  async obtenerPorCedula (cedula: string): Promise<Profesor | null> {
    return datos.find((p) => p.cedula === cedula) ?? null
  }

  async obtenerTodos (): Promise<Profesor[]> {
    return [...datos].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  async crear (profesor: Profesor): Promise<Profesor> {
    const existe = datos.find((p) => p.cedula === profesor.cedula)
    if (existe != null) {
      throw new Error(`Ya existe un profesor con cédula ${profesor.cedula}`)
    }
    datos.push(profesor)
    return profesor
  }

  async actualizarStatus (cedula: string, status: Profesor['status']): Promise<Profesor> {
    const index = datos.findIndex((p) => p.cedula === cedula)
    if (index === -1) {
      throw new Error(`Profesor no encontrado: ${cedula}`)
    }
    datos[index] = { ...datos[index], status }
    return datos[index]
  }
}