import { type User } from '../../domain/User.js'

export interface UserRepository {
  getByNombre: (nombre: string) => Promise<User | null>
}
