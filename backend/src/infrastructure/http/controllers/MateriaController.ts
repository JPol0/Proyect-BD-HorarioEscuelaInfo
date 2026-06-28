import { type Request, type Response } from 'express'
import { type GetMaterias } from '../../../application/useCases/useCasesMateria/GetMaterias.js'
import { type SaveMateria } from '../../../application/useCases/useCasesMateria/SaveMateria.js'
import { type Materia } from '../../../domain/Materia.js'

export class MateriaController {
  private readonly getUseCase: GetMaterias
  private readonly saveUseCase: SaveMateria

  constructor (
    getUseCase: GetMaterias,
    saveUseCase: SaveMateria
  ) {
    this.getUseCase = getUseCase
    this.saveUseCase = saveUseCase
  }

  /**
   * GET /api/materias
   * Devuelve el listado completo para que el frontend maneje los filtros locales.
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const materias = await this.getUseCase.execute()
      res.json(materias)
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar las materias del servidor' })
    }
  }

  /**
   * POST /api/materias
   * Procesa el guardado (creación/edición masiva desde PDF o manual desde formulario)
   */
  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaData = req.body as Materia

      // Una validación rápida antes de delegar al caso de uso
      if (materiaData.codMateria === undefined || materiaData.nombre === undefined) {
        res.status(400).json({ error: 'El código y el nombre de la materia son campos obligatorios' })
        return
      }

      await this.saveUseCase.execute(materiaData)
      res.json({ ok: true, message: 'Materia guardada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
