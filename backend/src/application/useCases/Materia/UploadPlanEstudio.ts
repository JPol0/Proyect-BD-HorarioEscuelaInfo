import { type MateriaRepository } from '../../ports/MateriaRepository.js'
import { parseExcelPlanEstudio } from '../../../infrastructure/http/adapters/excelPlanEstudioParser.js'

export class UploadPlanEstudio {
  constructor (private readonly repository: MateriaRepository) {}

  /**
   * Ejecuta la importación del plan de estudios desde un buffer de archivo Excel.
   * 1. Parsea el Excel para extraer materias y prerrequisitos crudos.
   * 2. Resuelve los prerrequisitos por nombre (match insensible a mayúsculas/minúsculas).
   * 3. Llama a repository.saveBatch con las materias y los prerrequisitos resueltos.
   */
  async execute (fileBuffer: Buffer): Promise<{ count: number, skipped: number }> {
    const { materias, skipped } = parseExcelPlanEstudio(fileBuffer)

    // Build a lookup map: nombre normalizado → codMateria
    const nombreToCode = new Map<string, string>()
    for (const m of materias) {
      nombreToCode.set(m.nombre.toLowerCase().trim(), m.codMateria)
    }

    // Resolve prerequisite names to prerequisite codes
    const prereqsResolved = materias.map(m => ({
      codMateria: m.codMateria,
      prereqNombres: m.prereqNombres
        .map(pName => {
          // Strip corequisite annotations like "(Correquisito)"
          const cleaned = pName.replace(/\(.*?\)/g, '').trim().toLowerCase()
          return nombreToCode.get(cleaned) ?? null
        })
        .filter((code): code is string => code !== null)
    }))

    await this.repository.saveBatchGlobal(materias, prereqsResolved)

    return { count: materias.length, skipped }
  }
}
