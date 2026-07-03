import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type Materia, type MateriaModalidad } from '../../../domain/Materia.js'
import { getPool } from './db.js'

export class PgMateriaRepository implements MateriaRepository {
  /**
   * Obtiene todas las materias de la base de datos relacional.
   */
  async getAll (): Promise<Materia[]> {
    const queryMaterias =
      `SELECT CodAsig, NombrePE, HoraPractica, HoraTeorica, HoraLaboratorio, SemestrePE, EsComunPE, ModalidadPE 
      FROM Materias;`

    const queryPlan =
      `SELECT CodAsig, NroSeccionesPE 
      FROM Plan_de_Estudio 
      WHERE CodTerm = COALESCE(
        (SELECT CodTerm FROM Terms WHERE StatusT = 'A' LIMIT 1),
        (SELECT CodTerm FROM Terms ORDER BY CodTerm DESC LIMIT 1),
        '1'
      );`

    interface MateriaRow {
      codasig: string
      nombrepe: string
      horapractica: number
      horateorica: number
      horalaboratorio: number
      semestrepe: number
      escomunpe: boolean
      modalidadpe: string
    }

    interface PlanRow {
      codasig: string
      nroseccionespe: number
    }

    const [materiasResult, planResult] = await Promise.all([
      getPool().query<MateriaRow>(queryMaterias),
      getPool().query<PlanRow>(queryPlan)
    ])

    const planMap = new Map<string, number>()
    planResult.rows.forEach(row => {
      planMap.set(row.codasig, Number(row.nroseccionespe))
    })

    return materiasResult.rows.map(row => {
      const codMateria = row.codasig
      const nroSecciones = planMap.get(codMateria) ?? 1
      const materia: Materia = {
        codMateria,
        nombre: row.nombrepe,
        nroSecciones,
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
  async save (materia: Materia): Promise<void> {
    if (materia.codMateria.trim() === '') {
      throw new Error('El código de materia es requerido para guardar en el repositorio')
    }

    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      // 1. Obtener el término activo o fallback
      interface TermRow {
        codterm: string
      }
      const termResult = await client.query<TermRow>(
        'SELECT CodTerm FROM Terms WHERE StatusT = \'A\' LIMIT 1;'
      )
      let codTerm = termResult.rows[0]?.codterm
      if (codTerm === undefined || codTerm === null) {
        const fallbackResult = await client.query<TermRow>(
          'SELECT CodTerm FROM Terms ORDER BY CodTerm DESC LIMIT 1;'
        )
        codTerm = fallbackResult.rows[0]?.codterm ?? '1'
      }

      // 2. Upsert en Plan_de_Estudio
      const planQuery = `
        INSERT INTO Plan_de_Estudio (CodAsig, CodTerm, NroSeccionesPE)
        VALUES ($1, $2, $3)
        ON CONFLICT (CodAsig, CodTerm) 
        DO UPDATE SET NroSeccionesPE = EXCLUDED.NroSeccionesPE;
      `
      await client.query(planQuery, [materia.codMateria, codTerm, materia.nroSecciones])

      // 3. Upsert en Materias
      const materiaQuery = `
        INSERT INTO Materias (CodAsig, NombrePE, HoraPractica, HoraTeorica, HoraLaboratorio, SemestrePE, EsComunPE, ModalidadPE)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (CodAsig) 
        DO UPDATE SET 
          NombrePE = EXCLUDED.NombrePE,
          HoraPractica = EXCLUDED.HoraPractica,
          HoraTeorica = EXCLUDED.HoraTeorica,
          HoraLaboratorio = EXCLUDED.HoraLaboratorio,
          SemestrePE = EXCLUDED.SemestrePE,
          EsComunPE = EXCLUDED.EsComunPE,
          ModalidadPE = EXCLUDED.ModalidadPE;
      `
      await client.query(materiaQuery, [
        materia.codMateria,
        materia.nombre,
        materia.horasPrac,
        materia.horasTeo,
        materia.horasLab,
        materia.semestre,
        materia.modalidad,
        materia.esComun
      ])

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
  async delete (codMateria: string): Promise<void> {
    const query = 'DELETE FROM Plan_de_Estudio WHERE CodAsig = $1'
    try {
      const result = await getPool().query(query, [codMateria])

      if (result.rowCount === 0) {
        throw new Error(`No se encontró la materia con código ${codMateria}`)
      }
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permisos de base de datos insuficientes para realizar esta operación.')
      }
      throw error
    }
  }
}
