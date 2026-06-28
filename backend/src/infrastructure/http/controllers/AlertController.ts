import { type Request, type Response } from 'express'
import { type GetAlertPending } from '../../../application/useCases/useCasesAlerts/GetAlertPending.js'
import { type SaveAlertState } from '../../../application/useCases/useCasesAlerts/SaveAlertState.js'
import { type AlertState } from '../../../domain/Alert.js'

export class AlertController {
  private readonly getUseCase: GetAlertPending
  private readonly saveUseCase: SaveAlertState

  constructor (
    getUseCase: GetAlertPending,
    saveUseCase: SaveAlertState
  ) {
    this.getUseCase = getUseCase
    this.saveUseCase = saveUseCase
  }

  getPending = async (req: Request, res: Response): Promise<void> => {
    try {
      const alerts = await this.getUseCase.execute()
      res.json(alerts)
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar alertas del servidor' })
    }
  }

  updateState = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const { estado, motivo } = req.body as { estado: AlertState, motivo?: string }

      await this.saveUseCase.execute(id, estado, motivo)
      res.json({ ok: true, message: 'Alerta gestionada correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
