import { type UserRepository } from '../../../application/ports/UserRepository.js'
import { type User, type UserRole } from '../../../domain/User.js'
import { getPool } from './db.js'

export class PgUserRepository implements UserRepository {
  async getByNombre (nombre: string): Promise<User | null> {
    const query = 'SELECT id, nombre, password, rol FROM usuarios WHERE nombre = $1'
    const result = await getPool().query(query, [nombre])

    if (result.rowCount === 0) {
      return null
    }

    const row = result.rows[0]
    const user: User = {
      id: Number(row.id),
      nombre: row.nombre,
      password: row.password,
      rol: row.rol as UserRole
    }

    return user
  }
}
