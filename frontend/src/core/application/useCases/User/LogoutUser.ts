import { type UserRepository } from '../../ports/UserRepository'

export class LogoutUser {
  private readonly userRepository: UserRepository

  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute (): Promise<void> {
    await this.userRepository.logout()
  }
}
