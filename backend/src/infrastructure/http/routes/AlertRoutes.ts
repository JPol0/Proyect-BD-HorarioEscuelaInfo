import { Router } from 'express'
import { MockAlertRepository } from '../../database/MockAlertRepository.js'
import { GetAlertPending } from '../../../application/useCases/GetAlertPending.js'
import { SaveAlertState } from '../../../application/useCases/SaveAlertState.js'
import { AlertController } from '../controllers/AlertController.js'

const router = Router()

// Inyección manual de dependencias
const repository = new MockAlertRepository()
const getUseCase = new GetAlertPending(repository)
const saveUseCase = new SaveAlertState(repository)
const controller = new AlertController(getUseCase, saveUseCase)

router.get('/pendings', controller.getPending)
router.patch('/:id/estado', controller.updateState)

export default router
