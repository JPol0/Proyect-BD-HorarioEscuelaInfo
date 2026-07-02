import { Router } from 'express'
import { type AlertRepository } from '../../../application/ports/AlertRepository.js'
import { GetAlertPending } from '../../../application/useCases/Alerts/GetAlertPending.js'
import { SaveAlertState } from '../../../application/useCases/Alerts/SaveAlertState.js'
import { AlertController } from '../controllers/AlertController.js'

export default function createAlertRouter (repository: AlertRepository): Router {
  const router = Router()

  const getUseCase = new GetAlertPending(repository)
  const saveUseCase = new SaveAlertState(repository)
  const controller = new AlertController(getUseCase, saveUseCase)

  router.get('/pendings', controller.getPending)
  router.patch('/:id/estado', controller.updateState)

  return router
}
