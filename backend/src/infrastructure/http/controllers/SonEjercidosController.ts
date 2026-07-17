import { type Request, type Response } from 'express'
import { type GetRelacionesSonEjercidos } from '../../../application/useCases/relacionSonEjercidos/GetRelacionesSonEjercidos.js'
import { type GetRelacionesSonEjercidosByMateria } from '../../../application/useCases/relacionSonEjercidos/GetRelacionesSonEjercidosByMateria.js'
import { type SaveRelacionSonEjercidos } from '../../../application/useCases/relacionSonEjercidos/SaveRelacionSonEjercidos.js'
import { type DeleteRelacionSonEjercidos } from '../../../application/useCases/relacionSonEjercidos/DeleteRelacionSonEjercidos.js'
import { type SonEjercidos } from '../../../domain/SonEjercidos.js'

export class SonEjercidosController {
  private readonly getUseCase: GetRelacionesSonEjercidos
  private readonly getByMateriaUseCase: GetRelacionesSonEjercidosByMateria
  private readonly saveUseCase: SaveRelacionSonEjercidos
  private readonly deleteUseCase: DeleteRelacionSonEjercidos

  constructor (
    getUseCase: GetRelacionesSonEjercidos,
    getByMateriaUseCase: GetRelacionesSonEjercidosByMateria,
    saveUseCase: SaveRelacionSonEjercidos,
    deleteUseCase: DeleteRelacionSonEjercidos
  ) {
    this.getUseCase = getUseCase
    this.getByMateriaUseCase = getByMateriaUseCase
    this.saveUseCase = saveUseCase
    this.deleteUseCase = deleteUseCase
  }

  get = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : ''
      const codAsig = typeof req.query.codAsig === 'string' ? req.query.codAsig : ''

      if (term.trim() === '') {
        res.status(400).json({ error: 'El parámetro term es obligatorio' })
        return
      }

      if (codAsig.trim() !== '') {
        const relaciones = await this.getByMateriaUseCase.execute(term, codAsig)
        res.json(relaciones)
      } else {
        const relaciones = await this.getUseCase.execute(term)
        res.json(relaciones)
      }
    } catch (error) {
      console.error('Error en SonEjercidosController.get:', error)
      res.status(500).json({ error: 'Error al recuperar las relaciones del servidor' })
    }
  }

  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const sonEjercidosData = req.body as SonEjercidos

      await this.saveUseCase.execute(sonEjercidosData)
      res.json({ ok: true, message: 'Relación guardada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const codLabVal = typeof req.query.codLab === 'string' ? Number(req.query.codLab) : NaN
      const codAsig = typeof req.query.codAsig === 'string' ? req.query.codAsig : ''
      const term = typeof req.query.term === 'string' ? req.query.term : ''

      await this.deleteUseCase.execute(codLabVal, codAsig, term)
      res.json({ ok: true, message: 'Relación eliminada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
