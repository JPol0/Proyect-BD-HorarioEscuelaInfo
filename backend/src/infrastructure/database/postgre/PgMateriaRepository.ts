import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type Materia, type MateriaModalidad } from '../../../domain/Materia.js'
import { getPool } from './db.js'

export class PgMateriaRepository implements MateriaRepository {
  /**
   * Obtiene todas las materias de la base de datos relacional.
   */
  async getAll (term: string): Promise<Materia[]> {
    const queryPlanEstudios =
      `SELECT p.CodAsig, p.NombrePE, p.HoraPractica, p.HoraTeorica, p.HoraLaboratorio, p.SemestrePE, p.EsComunPE, p.ModalidadPE,
              GREATEST(p.NroSeccionesPE, COALESCE(s.cant_sec, 0)) AS NroSeccionesPE
       FROM Plan_de_Estudio p
       LEFT JOIN (
         SELECT CodTerm, CodAsig, COUNT(*)::int AS cant_sec
         FROM Secciones
         GROUP BY CodTerm, CodAsig
       ) s ON p.CodTerm = s.CodTerm AND p.CodAsig = s.CodAsig
       WHERE p.CodTerm = $1;`

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
   * Obtiene una materia específica por su código y término.
   */
  async getById (term: string, codMateria: string, tx?: any): Promise<Materia | null> {
    const executor = tx ?? getPool()
    const query =
      `SELECT p.CodAsig, p.NombrePE, p.HoraPractica, p.HoraTeorica, p.HoraLaboratorio, p.SemestrePE, p.EsComunPE, p.ModalidadPE,
              GREATEST(p.NroSeccionesPE, COALESCE(s.cant_sec, 0)) AS NroSeccionesPE
       FROM Plan_de_Estudio p
       LEFT JOIN (
         SELECT CodTerm, CodAsig, COUNT(*)::int AS cant_sec
         FROM Secciones
         WHERE CodTerm = $1 AND CodAsig = $2
         GROUP BY CodTerm, CodAsig
       ) s ON p.CodTerm = s.CodTerm AND p.CodAsig = s.CodAsig
       WHERE p.CodTerm = $1 AND p.CodAsig = $2;`

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

    const result = await executor.query(query, [term, codMateria])
    if (result.rowCount === 0) {
      return null
    }

    const row = result.rows[0] as PlanEstudioRow
    return {
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
  }

  /**
   * Guarda una materia mediante un Upsert (inserta o actualiza si ya existe).
   */
  async save (term: string, materia: Materia, tx?: any): Promise<void> {
    if (materia.codMateria.trim() === '') {
      throw new Error('El código de materia es requerido para guardar en el repositorio')
    }

    const executor = tx ?? getPool()
    try {
      const query = `
        CALL upsert_materia($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `
      await executor.query(query, [
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
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
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
   * Limpia todas las materias y relaciones asociadas de un término.
   */
  async deleteByTerm (term: string, tx?: any): Promise<void> {
    const executor = tx ?? getPool()
    try {
      // Eliminar de Plan_de_Estudio (esto eliminará en cascada Secciones, Horarios, Prerequitos, etc.)
      await executor.query('DELETE FROM Plan_de_Estudio WHERE CodTerm = $1', [term])
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }
}
