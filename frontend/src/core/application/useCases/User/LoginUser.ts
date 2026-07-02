import { type UserRepository } from '../../ports/UserRepository'
import { type User } from '../../../domain/User'

export class LoginUser {
  private readonly userRepository: UserRepository

  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute (nombre: string, password: string): Promise<User> {
    return await this.userRepository.login(nombre, password)
  }
}
