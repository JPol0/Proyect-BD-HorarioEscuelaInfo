import { type User } from '../../domain/User'

export interface UserRepository {
  login: (nombre: string, password: string) => Promise<User>
  getAll: () => Promise<User[]>
  save: (user: User) => Promise<void>
}
