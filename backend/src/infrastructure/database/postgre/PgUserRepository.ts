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

  async getAll (): Promise<User[]> {
    const query = 'SELECT id, nombre, password, rol FROM usuarios ORDER BY id ASC'
    const result = await getPool().query(query)
    return result.rows.map(row => ({
      id: Number(row.id),
      nombre: row.nombre,
      password: row.password,
      rol: row.rol as UserRole
    }))
  }

  async save (user: User): Promise<void> {
    if (user.id !== undefined && !isNaN(user.id)) {
      if (user.password !== undefined && user.password !== '') {
        const query = 'UPDATE usuarios SET nombre = $1, rol = $2, password = $3 WHERE id = $4'
        await getPool().query(query, [user.nombre, user.rol, user.password, user.id])
      } else {
        const query = 'UPDATE usuarios SET nombre = $1, rol = $2 WHERE id = $3'
        await getPool().query(query, [user.nombre, user.rol, user.id])
      }
    } else {
      const password = user.password ?? ''
      const query = 'INSERT INTO usuarios (nombre, password, rol) VALUES ($1, $2, $3)'
      await getPool().query(query, [user.nombre, password, user.rol])
    }
  }

  async delete (id: number): Promise<void> {
    const query = 'DELETE FROM usuarios WHERE id = $1'
    await getPool().query(query, [id])
  }
}
