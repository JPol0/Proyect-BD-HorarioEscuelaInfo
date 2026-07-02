import { type UserRepository } from '../../ports/UserRepository.js'
import { type User } from '../../../domain/User.js'

export class Login {
  private readonly userRepository: UserRepository

  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute (nombre: string, password: string): Promise<User> {
    const user = await this.userRepository.getByNombre(nombre)
    if (user === null) {
      throw new Error('Usuario no encontrado o credenciales incorrectas.')
    }

    if (user.password !== password) {
      throw new Error('Usuario no encontrado o credenciales incorrectas.')
    }

    // Clonamos y eliminamos el campo password de la respuesta devuelta por seguridad
    const userResult: User = {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    }
    return userResult
  }
}
