import { type User } from '../../domain/User'

export interface UserRepository {
  login: (nombre: string, password: string) => Promise<User>
}
