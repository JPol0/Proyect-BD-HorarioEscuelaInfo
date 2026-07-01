import { type Request, type Response } from 'express'
import { type GetLaboratorios } from '../../../application/useCases/Laboratorio/GetLaboratorios.js'
import { type SaveLaboratorio } from '../../../application/useCases/Laboratorio/SaveLaboratorio.js'
import { type DeleteLaboratorio } from '../../../application/useCases/Laboratorio/DeleteLaboratorio.js'
import { type Laboratorio } from '../../../domain/Laboratorio.js'

export class LaboratorioController {
  private readonly getUseCase: GetLaboratorios
  private readonly saveUseCase: SaveLaboratorio
  private readonly deleteUseCase: DeleteLaboratorio

  constructor (
    getUseCase: GetLaboratorios,
    saveUseCase: SaveLaboratorio,
    deleteUseCase: DeleteLaboratorio
  ) {
    this.getUseCase = getUseCase
    this.saveUseCase = saveUseCase
    this.deleteUseCase = deleteUseCase
  }

  /**
   * GET /api/laboratorios
   * Devuelve todos los laboratorios disponibles.
   */
  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const laboratorios = await this.getUseCase.execute()
      res.json(laboratorios)
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar los laboratorios del servidor' })
    }
  }

  /**
   * POST /api/laboratorios
   * Crea o actualiza un laboratorio.
   */
  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as Laboratorio
      if (data.name === undefined || data.name === null || data.name.trim() === '') {
        res.status(400).json({ error: 'El nombre del laboratorio es obligatorio' })
        return
      }
      // Generamos un id si no viene en el body (creación)
      const laboratorio: Laboratorio = {
        id: data.id ?? String(Date.now()),
        name: data.name.trim()
      }
      await this.saveUseCase.execute(laboratorio)
      res.status(201).json(laboratorio)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  /**
   * DELETE /api/laboratorios/:id
   * Elimina un laboratorio por id.
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      await this.deleteUseCase.execute(id)
      res.json({ ok: true, message: 'Laboratorio eliminado correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
