import { type TermRepository } from '../../../application/ports/TermRepository.js'
import { type Term } from '../../../domain/Term.js'
import { getPool } from './db.js'

function parseDatesFromName (name: string): { startDate: string, endDate: string } {
  const match = name.match(/(Primer|Segundo)\s+Semestre\s+(\d{4})/i)
  if (match) {
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
        const { startDate, endDate } = parseDatesFromName(row.descripciont)
        return {
          id: row.codterm,
          name: row.descripciont,
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
      await client.query(query, [term.id, term.name, status])

      // 2. Buscar un término de origen que ya contenga materias del plan de estudios para copiar
      const sourceTermRes = await client.query(
        'SELECT CodTerm FROM Plan_de_Estudio LIMIT 1'
      )

      if (sourceTermRes.rowCount !== null && sourceTermRes.rowCount > 0) {
        const sourceTerm = sourceTermRes.rows[0].codterm as string

        // 3. Copiar las materias del término origen al nuevo término
        const copySubjectsQuery = `
          INSERT INTO Plan_de_Estudio (
            CodAsig, CodTerm, NombrePE, EsComunPE, SemestrePE,
            HoraPractica, HoraTeorica, HoraLaboratorio, ModalidadPE, NroSeccionesPE
          )
          SELECT 
            CodAsig, $1, NombrePE, EsComunPE, SemestrePE,
            HoraPractica, HoraTeorica, HoraLaboratorio, ModalidadPE, NroSeccionesPE
          FROM Plan_de_Estudio
          WHERE CodTerm = $2
        `
        await client.query(copySubjectsQuery, [term.id, sourceTerm])

        // 4. Copiar los prerrequisitos asociados
        const copyPrereqsQuery = `
          INSERT INTO Prerequitos (CodAsig, CodTerm, CodAsigPreq, CodTermPreq)
          SELECT CodAsig, $1, CodAsigPreq, $1
          FROM Prerequitos
          WHERE CodTerm = $2
        `
        await client.query(copyPrereqsQuery, [term.id, sourceTerm])
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
