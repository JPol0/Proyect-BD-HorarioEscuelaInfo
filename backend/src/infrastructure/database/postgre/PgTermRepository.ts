import { type TermRepository } from '../../../application/ports/TermRepository.js'
import { type Term } from '../../../domain/Term.js'
import { getPool } from './db.js'

function parseDatesFromName (name: string): { startDate: string, endDate: string } {
  const match = name.match(/(Primer|Segundo)\s+Semestre\s+(\d{4})/i)
  if (match !== null) {
    const sem = match[1].toLowerCase()
    const year = match[2]
    if (sem === 'primer') {
      return { startDate: `${year}-03-01`, endDate: `${year}-07-31` }
    } else {
      return { startDate: `${year}-08-01`, endDate: `${year}-12-31` }
    }
  }
  // Fallback to current year
  const currentYear = new Date().getFullYear()
  return { startDate: `${currentYear}-03-01`, endDate: `${currentYear}-07-31` }
}

export class PgTermRepository implements TermRepository {
  async getTerms (): Promise<Term[]> {
    const query = 'SELECT CodTerm, DescripcionT, StatusT FROM Terms ORDER BY DescripcionT DESC'
    try {
      const result = await getPool().query(query)
      return result.rows.map(row => {
        const { startDate, endDate } = parseDatesFromName(row.descripciont as string)
        return {
          id: row.codterm,
          descripcion: row.descripciont as string,
          startDate,
          endDate,
          archived: row.statust === 'D'
        }
      })
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  async createTerm (term: Term): Promise<void> {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      // 1. Insertar el nuevo término
      const query = `
        INSERT INTO Terms (CodTerm, DescripcionT, StatusT)
        VALUES ($1, $2, $3)
      `
      const status = term.archived ? 'D' : 'A'
      await client.query(query, [term.id, term.descripcion, status])

      await client.query('COMMIT')
    } catch (error: any) {
      await client.query('ROLLBACK')
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    } finally {
      client.release()
    }
  }

  async toggleArchive (id: string, archived: boolean): Promise<void> {
    const status = archived ? 'D' : 'A'
    const query = 'UPDATE Terms SET StatusT = $1 WHERE CodTerm = $2'
    try {
      const result = await getPool().query(query, [status, id])
      if (result.rowCount === 0) {
        throw new Error('El término solicitado no existe')
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  async deleteTerm (id: string): Promise<void> {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')
      // Deletions on Imparten first because of ON DELETE NO ACTION on its FK to Secciones
      await client.query('DELETE FROM Imparten WHERE CodTerm = $1', [id])
      const result = await client.query('DELETE FROM Terms WHERE CodTerm = $1', [id])
      if (result.rowCount === 0) {
        throw new Error('El término solicitado no existe')
      }
      await client.query('COMMIT')
    } catch (error: any) {
      await client.query('ROLLBACK')
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    } finally {
      client.release()
    }
  }
}
