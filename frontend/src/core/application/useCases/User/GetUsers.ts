import { type UserRepository } from '../../ports/UserRepository'
import { type User } from '../../../domain/User'

export class GetUsers {
  private readonly userRepository: UserRepository

  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute (): Promise<User[]> {
    return await this.userRepository.getAll()
  }
}
