import type { DisponibilidadLaboratorio } from '../../../domain/DisponibilidadLaboratorio.js'
import type { DisponibilidadLaboratorioRepository } from '../../../application/ports/DisponibilidadLaboratorioRepository.js'
import { getPool } from './db.js'

interface DisponibilidadLaboratorioRow {
  codlab: number
  codterm: string
  dia: string
  hora: string
  ocupadod: boolean
}

function dbHoraToEntity (horaDb: string): string {
  // e.g. "7" -> "07:00", "12" -> "12:00"
  return horaDb.padStart(2, '0') + ':00'
}

function entityHoraToDb (horaEntity: string): string {
  // e.g. "07:00" -> "7", "12:00" -> "12"
  return String(Number(horaEntity.split(':')[0]))
}

export class PgDisponibilidadLaboratorioRepository implements DisponibilidadLaboratorioRepository {
  async obtenerPorLaboratorioYTerm (idLaboratorio: number, codTerm: string): Promise<DisponibilidadLaboratorio[]> {
    const query = `
      SELECT CodLab, CodTerm, Dia, Hora, OcupadoD
      FROM Disponibilidad_Laboratorio
      WHERE CodLab = $1 AND CodTerm = $2
      ORDER BY Dia, Hora
    `
    const result = await getPool().query<DisponibilidadLaboratorioRow>(query, [idLaboratorio, codTerm])

    return result.rows.map((row) => ({
      idLaboratorio: Number(row.codlab),
      codTerm: row.codterm,
      dia: row.dia as DisponibilidadLaboratorio['dia'],
      hora: dbHoraToEntity(row.hora),
      ocupado: row.ocupadod
    }))
  }

  async eliminarPorLaboratorioYTerm (idLaboratorio: number, codTerm: string, tx?: any): Promise<void> {
    const executor = tx ?? getPool()
    const query = 'DELETE FROM Disponibilidad_Laboratorio WHERE CodLab = $1 AND CodTerm = $2'
    await executor.query(query, [idLaboratorio, codTerm])
  }

  async guardar (idLaboratorio: number, codTerm: string, disponibilidad: DisponibilidadLaboratorio[], tx?: any): Promise<void> {
    if (disponibilidad.length === 0) return

    const client = tx ?? await getPool().connect()
    const shouldManageTransaction = tx === undefined

    try {
      if (shouldManageTransaction) {
        await client.query('BEGIN')
      }

      for (const celda of disponibilidad) {
        await client.query(
          `
            INSERT INTO Disponibilidad_Laboratorio (CodLab, CodTerm, Dia, Hora, OcupadoD)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (CodTerm, CodLab, Dia, Hora)
            DO UPDATE SET OcupadoD = EXCLUDED.OcupadoD
          `,
          [
            idLaboratorio,
            codTerm,
            celda.dia,
            entityHoraToDb(celda.hora),
            celda.ocupado
          ]
        )
      }

      if (shouldManageTransaction) {
        await client.query('COMMIT')
      }
    } catch (error) {
      if (shouldManageTransaction) {
        await client.query('ROLLBACK')
      }
      throw error
    } finally {
      if (shouldManageTransaction) {
        client.release()
      }
    }
  }
}
