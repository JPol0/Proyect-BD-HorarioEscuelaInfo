import { type LaboratorioRepository } from '../../../application/ports/LaboratorioRepository.js'
import { type Laboratorio } from '../../../domain/Laboratorio.js'
import { getPool } from './db.js'

export class PgLaboratorioRepository implements LaboratorioRepository {
  /**
   * Obtiene todos los laboratorios de la base de datos.
   */
  async getAll (): Promise<Laboratorio[]> {
    const query = 'SELECT CodLab, NombreLab FROM Laboratorios ORDER BY CodLab ASC'
    const result = await getPool().query(query)
    return result.rows.map(row => ({
      id: Number(row.codlab),
      name: row.nombrelab as string
    }))
  }

  /**
   * Obtiene un laboratorio por su id.
   */
  async getById (id: number): Promise<Laboratorio | null> {
    const query = 'SELECT CodLab, NombreLab FROM Laboratorios WHERE CodLab = $1'
    const result = await getPool().query(query, [id])
    if (result.rowCount === 0) {
      return null
    }
    const row = result.rows[0]
    return {
      id: Number(row.codlab),
      name: row.nombrelab as string
    }
  }

  /**
   * Guarda un laboratorio: INSERT si id === 0, UPDATE si id > 0.
   */
  async save (laboratorio: Laboratorio): Promise<void> {
    if (laboratorio.name.trim() === '') {
      throw new Error('El nombre del laboratorio es obligatorio')
    }

    const client = await getPool().connect()
    try {
      if (laboratorio.id > 0) {
        // Actualización
        const query = 'UPDATE Laboratorios SET NombreLab = $1 WHERE CodLab = $2'
        const result = await client.query(query, [laboratorio.name.trim(), laboratorio.id])
        if (result.rowCount === 0) {
          throw new Error(`No se encontró el laboratorio con id ${laboratorio.id}`)
        }
      } else {
        // Creación — el SERIAL asigna el id automáticamente
        const query = 'INSERT INTO Laboratorios (NombreLab) VALUES ($1)'
        await client.query(query, [laboratorio.name.trim()])
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Elimina un laboratorio por su id numérico (CodLab).
   */
  async delete (id: number): Promise<void> {
    const query = 'DELETE FROM Laboratorios WHERE CodLab = $1'
    try {
      const result = await getPool().query(query, [id])
      if (result.rowCount === 0) {
        throw new Error(`No se encontró el laboratorio con id ${id}`)
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }
}
