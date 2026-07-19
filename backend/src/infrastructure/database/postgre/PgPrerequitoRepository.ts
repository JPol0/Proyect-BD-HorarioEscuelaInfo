import { type PrerequitoRepository } from '../../../application/ports/PrerequitoRepository.js'
import { type Prerequito } from '../../../domain/Prerequito.js'
import { getPool } from './db.js'

interface PrerequitoDbRow {
  codasig: string
  codterm: string
  codasigpreq: string
  codtermpreq: string
}

function dbToEntity (row: PrerequitoDbRow): Prerequito {
  return {
    codigoAsignatura: row.codasig,
    codigoTermAsignatura: row.codterm,
    codigoAsignaturaPrerequito: row.codasigpreq,
    codigoTermPrerequito: row.codtermpreq
  }
}

export class PgPrerequitoRepository implements PrerequitoRepository {
  async guardar (prerequito: Prerequito, tx?: any): Promise<void> {
    const executor = tx ?? getPool()
    const query = `
      INSERT INTO Prerequitos (CodAsig, CodTerm, CodAsigPreq, CodTermPreq)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING;
    `
    await executor.query(query, [
      prerequito.codigoAsignatura,
      prerequito.codigoTermAsignatura,
      prerequito.codigoAsignaturaPrerequito,
      prerequito.codigoTermPrerequito
    ])
  }

  async eliminar (
    codigoAsignatura: string,
    codigoTermAsignatura: string,
    codigoAsignaturaPrerequito: string,
    codigoTermPrerequito: string,
    tx?: any
  ): Promise<void> {
    const executor = tx ?? getPool()
    const query = `
      DELETE FROM Prerequitos 
      WHERE CodAsig = $1 AND CodTerm = $2 AND CodAsigPreq = $3 AND CodTermPreq = $4;
    `
    await executor.query(query, [
      codigoAsignatura,
      codigoTermAsignatura,
      codigoAsignaturaPrerequito,
      codigoTermPrerequito
    ])
  }

  async eliminarPorMateria (codigoAsignatura: string, codigoTermAsignatura: string, tx?: any): Promise<void> {
    const executor = tx ?? getPool()
    const query = `
      DELETE FROM Prerequitos 
      WHERE CodAsig = $1 AND CodTerm = $2;
    `
    await executor.query(query, [codigoAsignatura, codigoTermAsignatura])
  }

  async obtenerPorTerm (codigoTermAsignatura: string): Promise<Prerequito[]> {
    const query = `
      SELECT CodAsig, CodTerm, CodAsigPreq, CodTermPreq
      FROM Prerequitos
      WHERE CodTerm = $1;
    `
    const result = await getPool().query<PrerequitoDbRow>(query, [codigoTermAsignatura])
    return result.rows.map(dbToEntity)
  }

  async obtenerPorMateria (codigoAsignatura: string, codigoTermAsignatura: string): Promise<Prerequito[]> {
    const query = `
      SELECT CodAsig, CodTerm, CodAsigPreq, CodTermPreq
      FROM Prerequitos
      WHERE CodAsig = $1 AND CodTerm = $2;
    `
    const result = await getPool().query<PrerequitoDbRow>(query, [codigoAsignatura, codigoTermAsignatura])
    return result.rows.map(dbToEntity)
  }
}
