import { type Request, type Response } from 'express'
import { type GetRelacionesImparte } from '../../../application/useCases/relacionImparte/GetRelacionesImparte.js'
import { type GetRelacionesImparteByMateria } from '../../../application/useCases/relacionImparte/GetRelacionesImparteByMateria.js'
import { type SaveRelacionImparte } from '../../../application/useCases/relacionImparte/SaveRelacionImparte.js'
import { type DeleteRelacionImparte } from '../../../application/useCases/relacionImparte/DeleteRelacionImparte.js'
import { type Imparte } from '../../../domain/Imparte.js'

export class ImparteController {
  private readonly getUseCase: GetRelacionesImparte
  private readonly getByMateriaUseCase: GetRelacionesImparteByMateria
  private readonly saveUseCase: SaveRelacionImparte
  private readonly deleteUseCase: DeleteRelacionImparte

  constructor (
    getUseCase: GetRelacionesImparte,
    getByMateriaUseCase: GetRelacionesImparteByMateria,
    saveUseCase: SaveRelacionImparte,
    deleteUseCase: DeleteRelacionImparte
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
      console.error('Error en ImparteController.get:', error)
      res.status(500).json({ error: 'Error al recuperar las asignaciones del servidor' })
    }
  }

  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const imparteData = req.body as Imparte

      await this.saveUseCase.execute(imparteData)
      res.json({ ok: true, message: 'Asignación guardada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const cedulaP = typeof req.query.cedulaP === 'string' ? req.query.cedulaP : ''
      const codAsig = typeof req.query.codAsig === 'string' ? req.query.codAsig : ''
      const term = typeof req.query.term === 'string' ? req.query.term : ''
      const nroSeccionVal = typeof req.query.nroSeccion === 'string' ? Number(req.query.nroSeccion) : NaN

      await this.deleteUseCase.execute(cedulaP, codAsig, term, nroSeccionVal)
      res.json({ ok: true, message: 'Asignación eliminada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
