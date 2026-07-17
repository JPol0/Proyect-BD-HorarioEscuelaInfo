import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type Materia, type MateriaModalidad } from '../../../domain/Materia.js'
import { getPool } from './db.js'

export class PgMateriaRepository implements MateriaRepository {
  /**
   * Obtiene todas las materias de la base de datos relacional.
   */
  async getAll (term: string): Promise<Materia[]> {
    const queryPlanEstudios =
      `SELECT CodAsig, NombrePE, HoraPractica, HoraTeorica, HoraLaboratorio, SemestrePE, EsComunPE, ModalidadPE,
      NroSeccionesPE
      FROM Plan_de_Estudio
      WHERE CodTerm = $1
      ;`

    interface PlanEstudioRow {
      codasig: string
      nombrepe: string
      horapractica: number
      horateorica: number
      horalaboratorio: number
      semestrepe: number
      escomunpe: boolean
      modalidadpe: string
      nroseccionespe: number
    }

    const planEstudioResult = await getPool().query<PlanEstudioRow>(queryPlanEstudios, [term])

    return planEstudioResult.rows.map(row => {
      const materia: Materia = {
        codMateria: row.codasig,
        nombre: row.nombrepe,
        nroSecciones: Number(row.nroseccionespe),
        horasPrac: Number(row.horapractica),
        horasTeo: Number(row.horateorica),
        horasLab: Number(row.horalaboratorio),
        semestre: Number(row.semestrepe),
        modalidad: row.modalidadpe as MateriaModalidad,
        esComun: Boolean(row.escomunpe)
      }

      return materia
    })
  }

  /**
   * Guarda una materia mediante un Upsert (inserta o actualiza si ya existe).
   */
  async save (term: string, materia: Materia): Promise<void> {
    if (materia.codMateria.trim() === '') {
      throw new Error('El código de materia es requerido para guardar en el repositorio')
    }

    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      const query = `
        CALL upsert_materia($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `
      await client.query(query, [
        materia.codMateria,
        term,
        materia.nombre,
        materia.esComun,
        materia.semestre,
        materia.horasPrac,
        materia.horasTeo,
        materia.horasLab,
        materia.modalidad,
        materia.nroSecciones
      ])

      // Generar automáticamente las secciones según el nroSecciones
      const sectionsQuery = `
        INSERT INTO Secciones (CodTerm, CodAsig, NroSeccion)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING;
      `
      for (let i = 1; i <= materia.nroSecciones; i++) {
        await client.query(sectionsQuery, [term, materia.codMateria, i])
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

  /**
   * Elimina una materia por su clave primaria.
   */
  async delete (term: string, codMateria: string): Promise<void> {
    const query = 'DELETE FROM Plan_de_Estudio WHERE CodAsig = $1 AND CodTerm = $2'
    try {
      const result = await getPool().query(query, [codMateria, term])

      if (result.rowCount === 0) {
        throw new Error(`No se encontró la materia con código ${codMateria} para el término ${term}`)
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }

  /**
   * Guarda un lote de materias (upsert) y sus prerrequisitos de forma global para todos los términos de la BD.
   * prereqs es un array de { codMateria, prereqNombres: string[] } con códigos de asignatura ya resueltos.
   */
  async saveBatchGlobal (
    materias: Materia[],
    prereqs: Array<{ codMateria: string, prereqNombres: string[] }>
  ): Promise<void> {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      // Obtener todos los términos registrados
      const termsRes = await client.query('SELECT CodTerm FROM Terms')
      const termIds = termsRes.rows.map(row => row.codterm as string)

      if (termIds.length > 0) {
        const upsertQuery = `
          CALL upsert_materia($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `
        const insertedCodes = new Set(materias.map(m => m.codMateria))

        for (const termId of termIds) {
          // 1. Upsert de cada materia para este término
          for (const materia of materias) {
            await client.query(upsertQuery, [
              materia.codMateria,
              termId,
              materia.nombre,
              materia.esComun,
              materia.semestre,
              materia.horasPrac,
              materia.horasTeo,
              materia.horasLab,
              materia.modalidad,
              materia.nroSecciones
            ])
          }

          // 2. Cargar prerrequisitos de cada materia para este término
          for (const { codMateria, prereqNombres } of prereqs) {
            if (prereqNombres.length === 0) continue

            // Borrar prerrequisitos actuales de esta materia en este término
            await client.query(
              'DELETE FROM Prerequitos WHERE CodAsig = $1 AND CodTerm = $2',
              [codMateria, termId]
            )

            // Insertar nuevos prerrequisitos
            for (const prereqCode of prereqNombres) {
              if (!insertedCodes.has(prereqCode)) continue
              await client.query(
                `INSERT INTO Prerequitos (CodAsig, CodTerm, CodAsigPreq, CodTermPreq)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [codMateria, termId, prereqCode, termId]
              )
            }
          }
        }
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


