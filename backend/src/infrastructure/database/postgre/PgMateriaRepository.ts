import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type Materia, type MateriaModalidad } from '../../../domain/Materia.js'
import { pool } from './db.js'

export class PgMateriaRepository implements MateriaRepository {
  /**
   * Obtiene todas las materias de la base de datos relacional.
   */
  async getAll (): Promise<Materia[]> {
    const query =
      `SELECT cod_materia, nombre, nro_secciones, horas_teo, horas_lab, semestre, modalidad, es_comun 
      FROM materias;`
    const result = await pool.query(query)

    // Mapeamos las columnas snake_case de BD al formato camelCase de nuestro Dominio
    return result.rows.map(row => {
      const materia: Materia = {
        codMateria: row.cod_materia,
        nombre: row.nombre,
        nroSecciones: Number(row.nro_secciones),
        horasTeo: Number(row.horas_teo),
        horasLab: Number(row.horas_lab),
        semestre: Number(row.semestre),
        modalidad: row.modalidad as MateriaModalidad,
        esComun: Boolean(row.es_comun)
      }

      return materia
    })
  }

  /**
   * Guarda una materia mediante un Upsert (inserta o actualiza si ya existe).
   * Buena práctica: Se usan placeholders ($1, $2) para prevenir Inyección SQL.
   */
  async save (materia: Materia): Promise<void> {
    if (materia.codMateria.trim() === '') {
      throw new Error('El código de materia es requerido para guardar en el repositorio')
    }
    const query = `
      INSERT INTO materias (cod_materia, nombre, nro_secciones, horas_teo, horas_lab, semestre, modalidad, es_comun)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (cod_materia) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        nro_secciones = EXCLUDED.nro_secciones,
        horas_teo = EXCLUDED.horas_teo,
        horas_lab = EXCLUDED.horas_lab,
        semestre = EXCLUDED.semestre,
        modalidad = EXCLUDED.modalidad,
        es_comun = EXCLUDED.es_comun;
    `
    const values = [
      materia.codMateria,
      materia.nombre,
      materia.nroSecciones,
      materia.horasTeo,
      materia.horasLab,
      materia.semestre,
      materia.modalidad,
      materia.esComun
    ]
    await pool.query(query, values)
  }

  /**
   * Elimina una materia por su clave primaria.
   */
  async delete (codMateria: string): Promise<void> {
    const query = 'DELETE FROM materias WHERE cod_materia = $1'
    const result = await pool.query(query, [codMateria])

    if (result.rowCount === 0) {
      throw new Error(`No se encontró la materia con código ${codMateria}`)
    }
  }
}
