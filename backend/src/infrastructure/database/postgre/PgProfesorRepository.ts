import type { Profesor, ProfesorStatus } from '../../../domain/Profesor.js'
import type { ProfesorRepository } from '../../../application/ports/ProfesorRepository.js'
import { getPool } from './db.js'

interface ProfesorRow {
  cedulap: string
  nombrep: string
  statusp: string
}

export class PgProfesorRepository implements ProfesorRepository {
  async obtenerTodos (): Promise<Profesor[]> {
    const query = `
      SELECT CedulaP, NombreP, StatusP
      FROM Profesores
      ORDER BY NombreP ASC
    `
    const result = await getPool().query<ProfesorRow>(query)
    return result.rows.map((row) => ({
      cedula: row.cedulap,
      nombre: row.nombrep,
      status: row.statusp as ProfesorStatus
    }))
  }

  async obtenerPorCedula (cedula: string): Promise<Profesor | null> {
    const query = `
      SELECT CedulaP, NombreP, StatusP
      FROM Profesores
      WHERE CedulaP = $1
    `
    const result = await getPool().query<ProfesorRow>(query, [cedula])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      cedula: row.cedulap,
      nombre: row.nombrep,
      status: row.statusp as ProfesorStatus
    }
  }

  async crear (profesor: Profesor): Promise<Profesor> {
    const query = `
      INSERT INTO Profesores (CedulaP, NombreP, StatusP)
      VALUES ($1, $2, $3)
      RETURNING CedulaP, NombreP, StatusP
    `
    try {
      const result = await getPool().query<ProfesorRow>(query, [
        profesor.cedula,
        profesor.nombre,
        profesor.status
      ])
      const row = result.rows[0]
      return {
        cedula: row.cedulap,
        nombre: row.nombrep,
        status: row.statusp as ProfesorStatus
      }
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error(`Ya existe un profesor con cédula ${profesor.cedula}`)
      }
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  async actualizarStatus (cedula: string, status: ProfesorStatus): Promise<Profesor> {
    const query = `
      UPDATE Profesores
      SET StatusP = $1
      WHERE CedulaP = $2
      RETURNING CedulaP, NombreP, StatusP
    `
    try {
      const result = await getPool().query<ProfesorRow>(query, [status, cedula])
      if (result.rowCount === 0) {
        throw new Error(`No se encontró el profesor con cédula ${cedula}`)
      }
      const row = result.rows[0]
      return {
        cedula: row.cedulap,
        nombre: row.nombrep,
        status: row.statusp as ProfesorStatus
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }
}
