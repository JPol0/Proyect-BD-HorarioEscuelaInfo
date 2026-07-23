import { type PlanEstudioParserPort } from '../../ports/PlanEstudioParserPort.js'
import { type PrerequitoRepository } from '../../ports/PrerequitoRepository.js'
import { type SaveBatchMateria } from '../Materia/SaveBatchMateria.js'
import { type ClearTermUseCase } from '../Terms/ClearTermUseCase.js'
import { type TransactionManager } from '../../ports/TransactionManager.js'

export class UploadPlanEstudio {
  constructor (
    private readonly clearTermUseCase: ClearTermUseCase,
    private readonly saveBatchMateria: SaveBatchMateria,
    private readonly parser: PlanEstudioParserPort,
    private readonly prerequitoRepository: PrerequitoRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  /**
   * Ejecuta la importación del plan de estudios desde un buffer de archivo Excel.
   * 1. Limpia las materias y asignaciones docentes del término de forma transaccional.
   * 2. Parsea el Excel para extraer materias y prerrequisitos crudos.
   * 3. Resuelve los prerrequisitos por nombre.
   * 4. Guarda las materias y prerrequisitos de forma transaccional.
   */
  async execute (fileBuffer: Buffer, term: string): Promise<{ count: number, skipped: number }> {
    return await this.transactionManager.run(async (tx) => {
      // 1. Limpiar materias y asignaciones docentes existentes transaccionalmente
      await this.clearTermUseCase.execute(term, tx)

      // 2. Parsea el Excel
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

      // 3. Guardar materias para el término seleccionado usando el caso de uso SaveBatchMateria
      await this.saveBatchMateria.execute(term, materias, tx)

      // 4. Guardar prerrequisitos de forma transaccional
      for (const { codMateria, prereqNombres } of prereqsResolved) {
        // Eliminar prerrequisitos actuales para esta materia en este término
        await this.prerequitoRepository.eliminarPorMateria(codMateria, term, tx)

        // Guardar los nuevos prerrequisitos
        for (const prereqCode of prereqNombres) {
          await this.prerequitoRepository.guardar({
            codigoAsignatura: codMateria,
            codigoTermAsignatura: term,
            codigoAsignaturaPrerequito: prereqCode,
            codigoTermPrerequito: term
          }, tx)
        }
      }

      return { count: materias.length, skipped }
    })
  }
}
