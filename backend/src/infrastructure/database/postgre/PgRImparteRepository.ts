import { type RImparteRepository } from '../../../application/ports/RImparteRepository.js'
import { type Imparte } from '../../../domain/Imparte.js'
import { getPool } from './db.js'

export class PgRImparteRepository implements RImparteRepository {
  async getAll (term: string): Promise<Imparte[]> {
    const query = `
      SELECT cedulaP, CodAsig, CodTerm, NroSeccion, HorasLab, HorasTeo, Asignada
      FROM Imparten
      WHERE CodTerm = $1
    `
    interface ImpartenRow {
      cedulap: string
      codasig: string
      codterm: string
      nroseccion: number
      horaslab: number
      horasteo: number
      asignada: boolean
    }

    const result = await getPool().query<ImpartenRow>(query, [term])

    return result.rows.map(row => ({
      cedulaP: row.cedulap,
      codAsig: row.codasig,
      codTerm: row.codterm,
      nroSeccion: Number(row.nroseccion),
      horasLab: Number(row.horaslab),
      horasTeo: Number(row.horasteo),
      asignada: Boolean(row.asignada)
    }))
  }

  async getByMateria (term: string, codAsig: string): Promise<Imparte[]> {
    const query = `
      SELECT cedulaP, CodAsig, CodTerm, NroSeccion, HorasLab, HorasTeo, Asignada
      FROM Imparten
      WHERE CodTerm = $1 AND CodAsig = $2
    `
    interface ImpartenRow {
      cedulap: string
      codasig: string
      codterm: string
      nroseccion: number
      horaslab: number
      horasteo: number
      asignada: boolean
    }

    const result = await getPool().query<ImpartenRow>(query, [term, codAsig])

    return result.rows.map(row => ({
      cedulaP: row.cedulap,
      codAsig: row.codasig,
      codTerm: row.codterm,
      nroSeccion: Number(row.nroseccion),
      horasLab: Number(row.horaslab),
      horasTeo: Number(row.horasteo),
      asignada: Boolean(row.asignada)
    }))
  }

  async save (imparte: Imparte): Promise<void> {
    const query = 'CALL upsert_imparten($1, $2, $3, $4, $5, $6, $7);'
    try {
      await getPool().query(query, [
        imparte.cedulaP,
        imparte.codAsig,
        imparte.codTerm,
        imparte.nroSeccion,
        imparte.horasLab,
        imparte.horasTeo,
        imparte.asignada
      ])
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  async delete (cedulaP: string, codAsig: string, term: string, nroSeccion: number): Promise<void> {
    const query = `
      DELETE FROM Imparten
      WHERE cedulaP = $1 AND CodAsig = $2 AND CodTerm = $3 AND NroSeccion = $4
    `
    try {
      const result = await getPool().query(query, [cedulaP, codAsig, term, nroSeccion])
      if (result.rowCount === 0) {
        throw new Error('No se encontró la asignación (imparte) con los parámetros especificados')
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }
}
