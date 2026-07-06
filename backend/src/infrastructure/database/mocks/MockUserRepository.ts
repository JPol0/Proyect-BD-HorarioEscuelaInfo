import { type UserRepository } from '../../../application/ports/UserRepository.js'
import { type User } from '../../../domain/User.js'

const MOCK_USERS: User[] = [
  {
    id: 1,
    nombre: 'admin',
    rol: 'administrador',
    password: 'admin123'
  },
  {
    id: 2,
    nombre: 'lector',
    rol: 'lector',
    password: 'lector123'
  }
]

export class MockUserRepository implements UserRepository {
  async getByNombre (nombre: string): Promise<User | null> {
    const user = MOCK_USERS.find((u) => u.nombre === nombre)
    return user ?? null
  }

  async getAll (): Promise<User[]> {
    return MOCK_USERS.map(({ password, ...user }) => user)
  }

  async save (user: User): Promise<void> {
    if (user.nombre === undefined || user.nombre.trim() === '') {
      throw new Error('El nombre de usuario es requerido')
    }
    const index = MOCK_USERS.findIndex((u) => u.id === user.id || u.nombre === user.nombre)
    if (index !== -1) {
      MOCK_USERS[index] = {
        ...MOCK_USERS[index],
        ...user
      }
    } else {
      const newId = MOCK_USERS.length > 0 ? Math.max(...MOCK_USERS.map((u) => u.id)) + 1 : 1
      MOCK_USERS.push({
        ...user,
        id: newId
      })
    }
  }
}
