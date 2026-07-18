import { type MateriaRepository } from '../../ports/MateriaRepository.js'
import { type PlanEstudioParserPort } from '../../ports/PlanEstudioParserPort.js'

export class UploadPlanEstudio {
  constructor (
    private readonly repository: MateriaRepository,
    private readonly parser: PlanEstudioParserPort
  ) {}

  /**
   * Ejecuta la importación del plan de estudios desde un buffer de archivo Excel.
   * 1. Parsea el Excel para extraer materias y prerrequisitos crudos.
   * 2. Resuelve los prerrequisitos por nombre (match insensible a mayúsculas/minúsculas).
   * 3. Llama a repository.saveBatch con las materias y los prerrequisitos resueltos.
   */
  async execute (fileBuffer: Buffer, term: string, tx?: any): Promise<{ count: number, skipped: number }> {
    const { materias, skipped } = this.parser.parse(fileBuffer)

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

    // Guardar materias para el término seleccionado
    await this.repository.saveBatch(term, materias, prereqsResolved, tx)

    return { count: materias.length, skipped }
  }
}
