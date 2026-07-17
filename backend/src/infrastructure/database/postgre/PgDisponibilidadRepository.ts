import type { DiaSemana, DisponibilidadHoraria } from '../../../domain/DisponibilidadHoraria.js'
import type { DisponibilidadRepository } from '../../../application/ports/DisponibilidadRepository.js'
import { getPool } from './db.js'

interface DisponibilidadRow {
  codterm: string
  cedulap: string
  dia: string
  hora: string
  disponibilidad: number
  ocupadodh: boolean
}

/**
 * Convierte el numero de modulo del dominio (1-14, empezando a las 07:00)
 * al valor de hora VARCHAR almacenado en la BD ('7', '8', ..., '20').
 * Relación: hora_bd = numeroModulo + 6
 */
function moduloAHora (numeroModulo: number): string {
  return String(numeroModulo + 6)
}

/**
 * Convierte el valor de hora VARCHAR de la BD ('7', '8', ..., '20')
 * al numero de modulo del dominio (1-14).
 * Relación: numeroModulo = hora_bd - 6
 */
function horaAModulo (hora: string): number {
  return parseInt(hora, 10) - 6
}

export class PgDisponibilidadRepository implements DisponibilidadRepository {
  async obtenerPorProfesorYTerm (
    cedulaProfesor: string,
    codTerm: string
  ): Promise<DisponibilidadHoraria[]> {
    const query = `
      SELECT CodTerm, CedulaP, Dia, Hora, disponibilidad, ocupadoDH
      FROM Disponibilidad_Horaria
      WHERE CedulaP = $1 AND CodTerm = $2
    `
    const result = await getPool().query<DisponibilidadRow>(query, [cedulaProfesor, codTerm])

    return result.rows.map((row) => ({
      cedulaProfesor: row.cedulap,
      codTerm: row.codterm,
      dia: row.dia as DiaSemana,
      numeroModulo: horaAModulo(row.hora),
      disponibilidad: row.disponibilidad as 0 | 1 | 2,
      ocupado: row.ocupadodh,
      materiaAsignada: null // La tabla no almacena materiaAsignada; se mantiene null
    }))
  }

  async guardar (
    cedulaProfesor: string,
    codTerm: string,
    disponibilidad: DisponibilidadHoraria[]
  ): Promise<void> {
    if (disponibilidad.length === 0) return

    const pool = getPool()

    // Usamos un UPSERT para insertar o actualizar cada celda
    const upsertQuery = `
      INSERT INTO Disponibilidad_Horaria (CodTerm, CedulaP, Dia, Hora, disponibilidad, ocupadoDH)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (CodTerm, CedulaP, Dia, Hora)
      DO UPDATE SET
        disponibilidad = EXCLUDED.disponibilidad,
        ocupadoDH      = EXCLUDED.ocupadoDH
    `

    // Ejecutamos las upserts en paralelo dentro de una transacción
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      for (const celda of disponibilidad) {
        await client.query(upsertQuery, [
          codTerm,
          cedulaProfesor,
          celda.dia,
          moduloAHora(celda.numeroModulo),
          celda.disponibilidad,
          celda.ocupado
        ])
      }

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
