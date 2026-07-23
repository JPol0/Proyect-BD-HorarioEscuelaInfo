import type { DisponibilidadHoraria } from '../../../domain/DisponibilidadHoraria.js'
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

function moduloFromHora (hora: string): number {
  const horaNum = Number(hora)
  return horaNum - 6
}

function horaFromModulo (numeroModulo: number): string {
  return String(numeroModulo + 6)
}

export class PgDisponibilidadRepository implements DisponibilidadRepository {
  async obtenerPorProfesorYTerm (cedulaProfesor: string, codTerm: string): Promise<DisponibilidadHoraria[]> {
    const query = `
      SELECT CodTerm, CedulaP, Dia, Hora, disponibilidad, ocupadoDH
      FROM Disponibilidad_Horaria
      WHERE CedulaP = $1 AND CodTerm = $2
      ORDER BY Dia, Hora
    `
    const result = await getPool().query<DisponibilidadRow>(query, [cedulaProfesor, codTerm])

    return result.rows.map((row) => ({
      cedulaProfesor: row.cedulap,
      codTerm: row.codterm,
      dia: row.dia as DisponibilidadHoraria['dia'],
      numeroModulo: moduloFromHora(row.hora),
      disponibilidad: row.disponibilidad as DisponibilidadHoraria['disponibilidad'],
      ocupado: row.ocupadodh,
      materiaAsignada: null
    }))
  }

  async guardar (cedulaProfesor: string, codTerm: string, disponibilidad: DisponibilidadHoraria[], tx?: any): Promise<void> {
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
            INSERT INTO Disponibilidad_Horaria (CodTerm, CedulaP, Dia, Hora, disponibilidad, ocupadoDH)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (CodTerm, CedulaP, Dia, Hora)
            DO UPDATE SET disponibilidad = EXCLUDED.disponibilidad,
                          ocupadoDH = EXCLUDED.ocupadoDH
          `,
          [
            codTerm,
            cedulaProfesor,
            celda.dia,
            horaFromModulo(celda.numeroModulo),
            celda.disponibilidad,
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
