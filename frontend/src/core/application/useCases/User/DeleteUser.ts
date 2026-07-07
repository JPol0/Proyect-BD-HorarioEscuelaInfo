import { type UserRepository } from '../../ports/UserRepository'

export class DeleteUser {
  private readonly userRepository: UserRepository

  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute (id: number): Promise<void> {
    await this.userRepository.delete(id)
  }
}
