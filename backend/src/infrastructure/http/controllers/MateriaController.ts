import { type Request, type Response } from 'express'
import { type GetMaterias } from '../../../application/useCases/Materia/GetMaterias.js'
import { type SaveMateria } from '../../../application/useCases/Materia/SaveMateria.js'
import { type DeleteMateria } from '../../../application/useCases/Materia/DeleteMateria.js'
import { type Materia } from '../../../domain/Materia.js'

export class MateriaController {
  private readonly getUseCase: GetMaterias
  private readonly saveUseCase: SaveMateria
  private readonly deleteUseCase: DeleteMateria

  constructor (
    getUseCase: GetMaterias,
    saveUseCase: SaveMateria,
    deleteUseCase: DeleteMateria
  ) {
    this.getUseCase = getUseCase
    this.saveUseCase = saveUseCase
    this.deleteUseCase = deleteUseCase
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

      // Validación: El nombre es obligatorio. El código se generará en el repositorio si no se provee.
      if (materiaData.nombre === undefined || materiaData.nombre.trim() === '') {
        res.status(400).json({ error: 'El nombre de la materia es obligatorio' })
        return
      }

      await this.saveUseCase.execute(materiaData)
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
      await this.deleteUseCase.execute(codMateria)
      res.json({ ok: true, message: 'Materia eliminada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
