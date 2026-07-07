import { type UserRepository } from '../../ports/UserRepository'
import { type User } from '../../../domain/User'

export class SaveUser {
  private readonly userRepository: UserRepository

  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute (user: User): Promise<void> {
    await this.userRepository.save(user)
  }
}
