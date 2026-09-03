import { type HorarioRepository } from '../../../application/ports/HorarioRepository.js'
import { type Horario } from '../../../domain/Horario.js'
import { getPool } from './db.js'

const mapToFrontendHour = (dbHora: string): string => {
  const num = parseInt(dbHora, 10)
  return num < 10 ? `0${num}:00` : `${num}:00`
}

const mapToDbHour = (frontendHora: string): string => {
  return parseInt(frontendHora.split(':')[0], 10).toString()
}

export class PgHorarioRepository implements HorarioRepository {
  async getScheduleByTerm (term: string): Promise<Horario[] | null> {
    const query = `
      SELECT h.CodTerm, h.CodAsig, h.NroSeccion, h.CedulaP, h.DiaH, h.HoraH, h.CodLab,
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
      cedulaP: String(row.cedulap),
      dia: row.diah,
      hora: mapToFrontendHour(String(row.horah)),
      semestre: Number(row.semestrepe),
      laboratorio: (row.codlab !== null && row.codlab !== undefined) ? { id: Number(row.codlab), name: String(row.nombrelab) } : null
    }))
  }

  async saveSchedule (term: string, schedule: Horario[]): Promise<void> {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      // 1. Liberar disponibilidad del horario anterior (Profesores y Laboratorios)
      const releaseProfAvailabilityQuery = `
        UPDATE Disponibilidad_Horaria dh
        SET ocupadoDH = FALSE
        FROM Horarios h
        WHERE h.CodTerm = $1
          AND dh.CodTerm = h.CodTerm
          AND dh.CedulaP = h.CedulaP
          AND dh.Dia = h.DiaH
          AND dh.Hora = h.HoraH
      `
      await client.query(releaseProfAvailabilityQuery, [term])

      const releaseLabAvailabilityQuery = `
        UPDATE Disponibilidad_Laboratorio dl
        SET OcupadoD = FALSE
        FROM Horarios h
        WHERE h.CodTerm = $1
          AND h.CodLab IS NOT NULL
          AND dl.CodTerm = h.CodTerm
          AND dl.CodLab = h.CodLab
          AND dl.Dia = h.DiaH
          AND dl.Hora = h.HoraH
      `
      await client.query(releaseLabAvailabilityQuery, [term])

      // 1.5. Reiniciar Asignada a FALSE para todas las relaciones Imparten del término actual
      await client.query('UPDATE Imparten SET Asignada = FALSE WHERE CodTerm = $1', [term])

      // 2. Limpiar el horario anterior para este semestre
      const deleteQuery = 'DELETE FROM Horarios WHERE CodTerm = $1'
      await client.query(deleteQuery, [term])

      // 3. Insertar los nuevos bloques (si la lista no está vacía)
      if (schedule.length > 0) {
        const insertQuery = `
          INSERT INTO Horarios (CodTerm, CodAsig, NroSeccion, CedulaP, DiaH, HoraH, CodLab)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `
        for (const bloque of schedule) {
          const codLab = (bloque.laboratorio !== null && bloque.laboratorio !== undefined) ? bloque.laboratorio.id : null
          let cedulaP = bloque.cedulaP
          if (cedulaP === undefined || cedulaP === null || cedulaP.trim() === '') {
            const profRes = await client.query(
              `SELECT cedulaP FROM Imparten 
               WHERE CodTerm = $1 AND CodAsig = $2 AND NroSeccion = $3 
                 AND (($4::int IS NOT NULL AND HorasLab > 0) OR ($4::int IS NULL AND HorasTeo > 0))
               LIMIT 1`,
              [term, bloque.codAsig, bloque.nroSeccion, codLab]
            )
            if (profRes.rowCount !== null && profRes.rowCount > 0) {
              cedulaP = profRes.rows[0].cedulap
            } else {
              const fallbackProfRes = await client.query(
                'SELECT cedulaP FROM Imparten WHERE CodTerm = $1 AND CodAsig = $2 AND NroSeccion = $3 LIMIT 1',
                [term, bloque.codAsig, bloque.nroSeccion]
              )
              if (fallbackProfRes.rowCount !== null && fallbackProfRes.rowCount > 0) {
                cedulaP = fallbackProfRes.rows[0].cedulap
              }
            }
          }

          await client.query(insertQuery, [
            term,
            bloque.codAsig,
            bloque.nroSeccion,
            cedulaP,
            bloque.dia,
            mapToDbHour(bloque.hora),
            codLab
          ])
        }

        // 4. Ocupar disponibilidad del nuevo horario insertado (Profesores y Laboratorios)
        const occupyProfAvailabilityQuery = `
          UPDATE Disponibilidad_Horaria dh
          SET ocupadoDH = TRUE
          FROM Horarios h
          WHERE h.CodTerm = $1
            AND dh.CodTerm = h.CodTerm
            AND dh.CedulaP = h.CedulaP
            AND dh.Dia = h.DiaH
            AND dh.Hora = h.HoraH
        `
        await client.query(occupyProfAvailabilityQuery, [term])

        const occupyLabAvailabilityQuery = `
          INSERT INTO Disponibilidad_Laboratorio (CodLab, CodTerm, Dia, Hora, OcupadoD)
          SELECT h.CodLab, h.CodTerm, h.DiaH, h.HoraH, TRUE
          FROM Horarios h
          WHERE h.CodTerm = $1 AND h.CodLab IS NOT NULL
          ON CONFLICT (CodTerm, CodLab, Dia, Hora)
          DO UPDATE SET OcupadoD = TRUE
        `
        await client.query(occupyLabAvailabilityQuery, [term])

        // 5. Marcar como Asignada = TRUE solo a los profesores que tienen TODAS sus horas asignadas
        const checkAsignadaQuery = `
          UPDATE Imparten i
          SET Asignada = TRUE
          WHERE i.CodTerm = $1
            AND (i.HorasTeo + i.HorasLab) > 0
            AND (i.HorasTeo + i.HorasLab) = (
              SELECT COUNT(*)
              FROM Horarios h
              WHERE h.CodTerm = i.CodTerm
                AND h.CodAsig = i.CodAsig
                AND h.NroSeccion = i.NroSeccion
                AND h.CedulaP = i.cedulaP
            )
        `
        await client.query(checkAsignadaQuery, [term])
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
