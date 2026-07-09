import { type User } from '../../domain/User.js'

export interface UserRepository {
  getByNombre: (nombre: string) => Promise<User | null>
  getAll: () => Promise<User[]>
  save: (user: User) => Promise<void>
  delete: (id: number) => Promise<void>
}
