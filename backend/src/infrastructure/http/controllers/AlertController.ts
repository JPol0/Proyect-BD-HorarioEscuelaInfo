import { type Request, type Response } from 'express'
import { type GetAllAlerts } from '../../../application/useCases/Alerts/GetAllAlerts.js'
import { type SaveAlertState } from '../../../application/useCases/Alerts/SaveAlertState.js'
import { type Alert } from '../../../domain/Alert.js'

export class AlertController {
  private readonly getUseCase: GetAllAlerts
  private readonly saveUseCase: SaveAlertState

  constructor (
    getUseCase: GetAllAlerts,
    saveUseCase: SaveAlertState
  ) {
    this.getUseCase = getUseCase
    this.saveUseCase = saveUseCase
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : null
      if (term === null) {
        res.status(400).json({ error: 'El term es obligatorio' })
        return
      }
      const alerts = await this.getUseCase.execute(term)
      res.json(alerts)
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar alertas del servidor' })
    }
  }

  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : null
      const alertData = req.body as Alert

      if (term === null) {
        res.status(400).json({ error: 'El term es obligatorio' })
        return
      }

      await this.saveUseCase.execute(term, alertData)
      res.json({ ok: true, message: 'Alerta gestionada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
