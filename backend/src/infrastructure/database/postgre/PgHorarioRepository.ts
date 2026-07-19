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
      laboratorio: (row.codlab !== null && row.codlab !== undefined) ? { id: Number(row.codlab), name: String(row.nombrelab) } : null
    }))
  }

  async saveSchedule (term: string, schedule: Horario[]): Promise<void> {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      // 1. Liberar disponibilidad del horario anterior
      const releaseAvailabilityQuery = `
        UPDATE Disponibilidad_Horaria dh
        SET ocupadoDH = FALSE
        FROM Horarios h
        JOIN Imparten i ON h.CodTerm = i.CodTerm AND h.CodAsig = i.CodAsig AND h.NroSeccion = i.NroSeccion
        WHERE h.CodTerm = $1
          AND dh.CodTerm = h.CodTerm
          AND dh.CedulaP = i.cedulaP
          AND dh.Dia = h.DiaH
          AND dh.Hora = h.HoraH
          AND (
            (h.CodLab IS NULL AND i.HorasTeo > 0) OR
            (h.CodLab IS NOT NULL AND i.HorasLab > 0)
          )
      `
      await client.query(releaseAvailabilityQuery, [term])

      // 2. Limpiar el horario anterior para este semestre
      const deleteQuery = 'DELETE FROM Horarios WHERE CodTerm = $1'
      await client.query(deleteQuery, [term])

      // 3. Insertar los nuevos bloques (si la lista no está vacía)
      if (schedule.length > 0) {
        const insertQuery = `
          INSERT INTO Horarios (CodTerm, CodAsig, NroSeccion, DiaH, HoraH, CodLab)
          VALUES ($1, $2, $3, $4, $5, $6)
        `
        for (const bloque of schedule) {
          const codLab = (bloque.laboratorio !== null && bloque.laboratorio !== undefined) ? bloque.laboratorio.id : null
          await client.query(insertQuery, [
            term,
            bloque.codAsig,
            bloque.nroSeccion,
            bloque.dia,
            bloque.hora,
            codLab
          ])
        }

        // 4. Ocupar disponibilidad del nuevo horario insertado
        const occupyAvailabilityQuery = `
          UPDATE Disponibilidad_Horaria dh
          SET ocupadoDH = TRUE
          FROM Horarios h
          JOIN Imparten i ON h.CodTerm = i.CodTerm AND h.CodAsig = i.CodAsig AND h.NroSeccion = i.NroSeccion
          WHERE h.CodTerm = $1
            AND dh.CodTerm = h.CodTerm
            AND dh.CedulaP = i.cedulaP
            AND dh.Dia = h.DiaH
            AND dh.Hora = h.HoraH
            AND (
              (h.CodLab IS NULL AND i.HorasTeo > 0) OR
              (h.CodLab IS NOT NULL AND i.HorasLab > 0)
            )
        `
        await client.query(occupyAvailabilityQuery, [term])
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
