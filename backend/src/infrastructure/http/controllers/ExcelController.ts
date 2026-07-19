import { type Request, type Response } from 'express'
import { type UploadPlanEstudio } from '../../../application/useCases/PlanEstudio/UploadPlanEstudio.js'

export class ExcelController {
  constructor (
    private readonly uploadUseCase: UploadPlanEstudio
  ) {}

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

      const result = await this.uploadUseCase.execute(file.buffer, term)
      res.json({ ok: true, count: result.count, skipped: result.skipped })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno al procesar el Excel'
      res.status(400).json({ error: mensaje })
    }
  }
}
