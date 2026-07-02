import { Router } from 'express'
import { type AlertRepository } from '../../../application/ports/AlertRepository.js'
import { GetAllAlerts } from '../../../application/useCases/Alerts/GetAllAlerts.js'
import { SaveAlertState } from '../../../application/useCases/Alerts/SaveAlertState.js'
import { AlertController } from '../controllers/AlertController.js'

export default function createAlertRouter (repository: AlertRepository): Router {
  const router = Router()

  const getUseCase = new GetAllAlerts(repository)
  const saveUseCase = new SaveAlertState(repository)
  const controller = new AlertController(getUseCase, saveUseCase)

  router.get('/', controller.getAll)
  router.patch('/:id/estado', controller.updateState)

  return router
}
