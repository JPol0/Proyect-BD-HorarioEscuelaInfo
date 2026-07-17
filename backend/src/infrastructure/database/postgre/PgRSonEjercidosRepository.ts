import { type RSonEjercidosRepository } from '../../../application/ports/RSonEjercidosRepository.js'
import { type SonEjercidos, type PrioridadLab } from '../../../domain/SonEjercidos.js'
import { getPool } from './db.js'

export class PgRSonEjercidosRepository implements RSonEjercidosRepository {
  async getAll (term: string): Promise<SonEjercidos[]> {
    const query = `
      SELECT CodLab, CodAsig, CodTerm, prioridad
      FROM Son_ejercidos
      WHERE CodTerm = $1
    `
    interface SonEjercidosRow {
      codlab: number
      codasig: string
      codterm: string
      prioridad: number
    }

    const result = await getPool().query<SonEjercidosRow>(query, [term])
    return result.rows.map(row => ({
      codLab: Number(row.codlab),
      codAsig: row.codasig,
      codTerm: row.codterm,
      prioridad: Number(row.prioridad) as PrioridadLab
    }))
  }

  async getByMateria (term: string, codAsig: string): Promise<SonEjercidos[]> {
    const query = `
      SELECT CodLab, CodAsig, CodTerm, prioridad
      FROM Son_ejercidos
      WHERE CodTerm = $1 AND CodAsig = $2
    `
    interface SonEjercidosRow {
      codlab: number
      codasig: string
      codterm: string
      prioridad: number
    }

    const result = await getPool().query<SonEjercidosRow>(query, [term, codAsig])
    return result.rows.map(row => ({
      codLab: Number(row.codlab),
      codAsig: row.codasig,
      codTerm: row.codterm,
      prioridad: Number(row.prioridad) as PrioridadLab
    }))
  }

  async save (sonEjercidos: SonEjercidos): Promise<void> {
    if (sonEjercidos.prioridad !== 1 && sonEjercidos.prioridad !== 2) {
      throw new Error('La prioridad debe ser 1 o 2')
    }

    const query = `
      INSERT INTO Son_ejercidos (CodLab, CodAsig, CodTerm, prioridad)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (CodTerm, CodAsig, CodLab)
      DO UPDATE SET prioridad = EXCLUDED.prioridad;
    `
    try {
      await getPool().query(query, [
        sonEjercidos.codLab,
        sonEjercidos.codAsig,
        sonEjercidos.codTerm,
        sonEjercidos.prioridad
      ])
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  async delete (codLab: number, codAsig: string, term: string): Promise<void> {
    const query = `
      DELETE FROM Son_ejercidos
      WHERE CodLab = $1 AND CodAsig = $2 AND CodTerm = $3
    `
    try {
      const result = await getPool().query(query, [codLab, codAsig, term])
      if (result.rowCount === 0) {
        throw new Error('No se encontró la relación con los parámetros especificados')
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }
}
