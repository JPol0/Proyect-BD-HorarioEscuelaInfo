import { type Request, type Response } from 'express'
import { type GetMaterias } from '../../../application/useCases/Materia/GetMaterias.js'
import { type SaveMateria } from '../../../application/useCases/Materia/SaveMateria.js'
import { type DeleteMateria } from '../../../application/useCases/Materia/DeleteMateria.js'
import { type UploadPlanEstudio } from '../../../application/useCases/PlanEstudio/UploadPlanEstudio.js'
import { type ClearTermUseCase } from '../../../application/useCases/Terms/ClearTermUseCase.js'
import { type TransactionManager } from '../../../application/ports/TransactionManager.js'
import { type Materia } from '../../../domain/Materia.js'

export class MateriaController {
  private readonly getUseCase: GetMaterias
  private readonly saveUseCase: SaveMateria
  private readonly deleteUseCase: DeleteMateria
  private readonly uploadUseCase: UploadPlanEstudio
  private readonly clearTermUseCase: ClearTermUseCase
  private readonly transactionManager: TransactionManager

  constructor (
    getUseCase: GetMaterias,
    saveUseCase: SaveMateria,
    deleteUseCase: DeleteMateria,
    uploadUseCase: UploadPlanEstudio,
    clearTermUseCase: ClearTermUseCase,
    transactionManager: TransactionManager
  ) {
    this.getUseCase = getUseCase
    this.saveUseCase = saveUseCase
    this.deleteUseCase = deleteUseCase
    this.uploadUseCase = uploadUseCase
    this.clearTermUseCase = clearTermUseCase
    this.transactionManager = transactionManager
  }

  /**
   * GET /api/materias
   * Devuelve el listado completo para que el frontend maneje los filtros locales.
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : ''
      if (term.trim() === '') {
        res.json([])
        return
      }
      const materias = await this.getUseCase.execute(term)
      res.json(materias)
    } catch (error) {
      console.error('Error en MateriaController.getAll:', error)
      res.status(500).json({ error: 'Error al recuperar las materias del servidor' })
    }
  }

  /**
   * POST /api/materias
   * Procesa el guardado (creación/edición masiva desde PDF o manual desde formulario)
   */
  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : null
      const materiaData = req.body as Materia

      // Validación: El nombre es obligatorio. El código se generará en el repositorio si no se provee.
      if (materiaData.nombre === undefined || materiaData.nombre.trim() === '') {
        res.status(400).json({ error: 'El nombre de la materia es obligatorio' })
        return
      }
      if (term === null) {
        res.status(400).json({ error: 'El term es obligatorio' })
        return
      }
      await this.saveUseCase.execute(term, materiaData)
      res.json({ ok: true, message: 'Materia guardada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  /**
   * DELETE /api/materias/:codMateria
   * Elimina una materia.
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codMateria } = req.params as { codMateria: string }
      if (codMateria === undefined || codMateria.trim() === '') {
        res.status(400).json({ error: 'El código de la materia es obligatorio para eliminar' })
        return
      }
      const term = typeof req.query.term === 'string' ? req.query.term : null
      if (term === null) {
        res.status(400).json({ error: 'El term es obligatorio' })
        return
      }
      await this.deleteUseCase.execute(term, codMateria)
      res.json({ ok: true, message: 'Materia eliminada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  /**
   * POST /api/materias/upload-excel
   * Procesa la carga masiva del Plan de Estudio desde un archivo Excel para un término seleccionado.
   */
  uploadExcel = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : null
      if (term === null || term.trim() === '') {
        res.status(400).json({ error: 'El término (term) es obligatorio para cargar el plan de estudios' })
        return
      }

      const file = (req as any).file as Express.Multer.File | undefined
      if (file === undefined) {
        res.status(400).json({ error: 'No se recibió ningún archivo Excel' })
        return
      }

      const result = await this.transactionManager.run(async (tx) => {
        // 1. Limpiar materias y asignaciones docentes existentes transaccionalmente
        await this.clearTermUseCase.execute(term, tx)

        // 2. Guardar el nuevo plan de estudios transaccionalmente
        return await this.uploadUseCase.execute(file.buffer, term, tx)
      })

      res.json({ ok: true, count: result.count, skipped: result.skipped })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno al procesar el Excel'
      res.status(400).json({ error: mensaje })
    }
  }
}
