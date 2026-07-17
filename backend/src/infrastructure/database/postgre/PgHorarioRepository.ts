import { type HorarioRepository } from '../../../application/ports/HorarioRepository.js'
import { type Horario } from '../../../domain/Horario.js'
import { getPool } from './db.js'

export class PgHorarioRepository implements HorarioRepository {
  async getScheduleByTerm (term: string): Promise<Horario[] | null> {
    const query = `
      SELECT h.CodTerm, h.CodAsig, h.NroSeccion, h.DiaH, h.HoraH, h.CodLab,
             l.NombreLab, p.SemestrePE
      FROM Horarios h
      LEFT JOIN Laboratorios l ON h.CodLab = l.CodLab
      INNER JOIN Plan_de_Estudio p ON h.CodAsig = p.CodAsig AND h.CodTerm = p.CodTerm
      WHERE h.CodTerm = $1
    `
    const result = await getPool().query(query, [term])

    if (result.rowCount === 0) {
      return null
    }

    return result.rows.map(row => ({
      codTerm: row.codterm,
      codAsig: row.codasig,
      nroSeccion: Number(row.nroseccion),
      dia: row.diah,
      hora: row.horah,
      semestre: Number(row.semestrepe),
      laboratorio: row.codlab ? { id: Number(row.codlab), name: row.nombrelab } : null
    }))
  }

  async saveSchedule (term: string, schedule: Horario[]): Promise<void> {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      // 1. Limpiar el horario anterior para este semestre
      const deleteQuery = 'DELETE FROM Horarios WHERE CodTerm = $1'
      await client.query(deleteQuery, [term])

      // 2. Insertar los nuevos bloques (si la lista no está vacía)
      if (schedule.length > 0) {
        const insertQuery = `
          INSERT INTO Horarios (CodTerm, CodAsig, NroSeccion, DiaH, HoraH, CodLab)
          VALUES ($1, $2, $3, $4, $5, $6)
        `
        for (const bloque of schedule) {
          const codLab = bloque.laboratorio ? bloque.laboratorio.id : null
          await client.query(insertQuery, [
            bloque.codTerm,
            bloque.codAsig,
            bloque.nroSeccion,
            bloque.dia,
            bloque.hora,
            codLab
          ])
        }
      }

      await client.query('COMMIT')
    } catch (error: any) {
      await client.query('ROLLBACK')
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para guardar el horario.')
      } else if (error.code === '23503') {
        throw new Error('Error de integridad: La sección o el laboratorio asignado no existe en la base de datos.')
      }
      throw error
    } finally {
      client.release()
    }
  }
}
