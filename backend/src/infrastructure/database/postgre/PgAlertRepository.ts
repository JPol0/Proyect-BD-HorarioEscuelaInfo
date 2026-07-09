import { type AlertRepository } from '../../../application/ports/AlertRepository.js'
import { type Alert, type AlertState } from '../../../domain/Alert.js'
import { getPool } from './db.js'

export class PgAlertRepository implements AlertRepository {
  async getAllAlerts (term: string): Promise<Alert[]> {
    const query = `
      SELECT CodWarning, CodTerm, FechaW, EstadoW, DescripcionW, ComentarioW
      FROM Warnings
      WHERE CodTerm = $1
      ORDER BY FechaW DESC;
    `
    const result = await getPool().query(query, [term])
    console.log('result.rows:', result.rows) // Agrega este log para depuración
    return result.rows.map(row => {
      let estado: AlertState = 'PENDIENTE'
      if (row.estadow === 'R') {
        estado = 'RESUELTA'
      } else if (row.estadow === 'I') {
        estado = 'IGNORADA'
      }

      return {
        id: Number(row.codwarning),
        titulo: row.descripcionw,
        estado,
        fecha: row.fechaw ?? new Date().toISOString().replace('Z', ''),
        motivoCambio: row.comentariow ?? undefined
      }
    })
  }

  async save (term: string, alert: Alert): Promise<void> {
    let dbEstado: string | null = null
    if (alert.estado === 'PENDIENTE') {
      dbEstado = 'P'
    } else if (alert.estado === 'RESUELTA') {
      dbEstado = 'R'
    } else if (alert.estado === 'IGNORADA') {
      dbEstado = 'I'
    }

    const client = await getPool().connect()
    try {
      const query = `
        CALL upsert_warning($1, $2, $3, $4, $5, $6);
      `
      await client.query(query, [
        alert.id,
        term,
        alert.fecha != null && alert.fecha.trim() !== '' ? alert.fecha : null,
        dbEstado,
        alert.titulo != null && alert.titulo.trim() !== '' ? alert.titulo : null,
        alert.motivoCambio ?? null
      ])
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    } finally {
      client.release()
    }
  }
}
