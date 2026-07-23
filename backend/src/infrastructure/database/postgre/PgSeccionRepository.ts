import { type SeccionRepository } from '../../../application/ports/SeccionRepository.js'
import { type Seccion } from '../../../domain/Seccion.js'
import { getPool } from './db.js'

export class PgSeccionRepository implements SeccionRepository {
  async getSecciones (codTerm: string, codMateria: string, tx?: any): Promise<Seccion[]> {
    const executor = tx ?? getPool()
    const query = `
      SELECT NroSeccion, CodTerm, CodAsig
      FROM Secciones
      WHERE CodTerm = $1 AND CodAsig = $2
      ORDER BY NroSeccion ASC
    `
    const result = await executor.query(query, [codTerm, codMateria])

    return result.rows.map((row: any) => ({
      nroSeccion: Number(row.nroseccion),
      codTerm: row.codterm,
      codMateria: row.codasig
    }))
  }

  async getSeccion (codTerm: string, codMateria: string, nroSeccion: number, tx?: any): Promise<Seccion | null> {
    const executor = tx ?? getPool()
    const query = `
      SELECT NroSeccion, CodTerm, CodAsig
      FROM Secciones
      WHERE CodTerm = $1 AND CodAsig = $2 AND NroSeccion = $3
    `
    const result = await executor.query(query, [codTerm, codMateria, nroSeccion])

    if (result.rowCount === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      nroSeccion: Number(row.nroseccion),
      codTerm: row.codterm,
      codMateria: row.codasig
    }
  }

  async saveSeccion (seccion: Seccion, tx?: any): Promise<void> {
    const executor = tx ?? getPool()
    const query = `
      INSERT INTO Secciones (CodTerm, CodAsig, NroSeccion)
      VALUES ($1, $2, $3)
    `
    try {
      await executor.query(query, [seccion.codTerm, seccion.codMateria, seccion.nroSeccion])
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  async deleteSeccion (codTerm: string, codMateria: string, nroSeccion: number, tx?: any): Promise<void> {
    const shouldManageTransaction = tx === undefined
    const client = tx ?? await getPool().connect()

    try {
      if (shouldManageTransaction) {
        await client.query('BEGIN')
      }

      // 1. Liberar disponibilidad del profesor de la sección eliminada
      const releaseProfAvailabilityQuery = `
        UPDATE Disponibilidad_Horaria dh
        SET ocupadoDH = FALSE
        FROM Horarios h
        JOIN Imparten i ON h.CodTerm = i.CodTerm AND h.CodAsig = i.CodAsig AND h.NroSeccion = i.NroSeccion
        WHERE h.CodTerm = $1 AND h.CodAsig = $2 AND h.NroSeccion = $3
          AND dh.CodTerm = h.CodTerm
          AND dh.CedulaP = i.cedulaP
          AND dh.Dia = h.DiaH
          AND dh.Hora = h.HoraH
          AND (
            (h.CodLab IS NULL AND i.HorasTeo > 0) OR
            (h.CodLab IS NOT NULL AND i.HorasLab > 0)
          )
      `
      await client.query(releaseProfAvailabilityQuery, [codTerm, codMateria, nroSeccion])

      // 2. Liberar disponibilidad del laboratorio de la sección eliminada
      const releaseLabAvailabilityQuery = `
        UPDATE Disponibilidad_Laboratorio dl
        SET OcupadoD = FALSE
        FROM Horarios h
        WHERE h.CodTerm = $1 AND h.CodAsig = $2 AND h.NroSeccion = $3
          AND h.CodLab IS NOT NULL
          AND dl.CodTerm = h.CodTerm
          AND dl.CodLab = h.CodLab
          AND dl.Dia = h.DiaH
          AND dl.Hora = h.HoraH
      `
      await client.query(releaseLabAvailabilityQuery, [codTerm, codMateria, nroSeccion])

      // 3. Eliminar relaciones en la tabla Imparten para evitar error de foreign key (ON DELETE NO ACTION)
      await client.query(
        'DELETE FROM Imparten WHERE CodTerm = $1 AND CodAsig = $2 AND NroSeccion = $3',
        [codTerm, codMateria, nroSeccion]
      )

      const query = `
        DELETE FROM Secciones
        WHERE CodTerm = $1 AND CodAsig = $2 AND NroSeccion = $3
      `
      const result = await client.query(query, [codTerm, codMateria, nroSeccion])
      if (result.rowCount === 0) {
        throw new Error('No se encontró la sección especificada.')
      }

      // Actualizar el contador en Plan_de_Estudio
      await client.query(
        'UPDATE Plan_de_Estudio SET NroSeccionesPE = GREATEST(0, NroSeccionesPE - 1) WHERE CodTerm = $1 AND CodAsig = $2',
        [codTerm, codMateria]
      )

      if (shouldManageTransaction) {
        await client.query('COMMIT')
      }
    } catch (error: any) {
      if (shouldManageTransaction) {
        await client.query('ROLLBACK')
      }
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    } finally {
      if (shouldManageTransaction) {
        client.release()
      }
    }
  }
}
