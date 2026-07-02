import { Router } from 'express'
import { type LaboratorioRepository } from '../../../application/ports/LaboratorioRepository.js'
import { GetLaboratorios } from '../../../application/useCases/Laboratorio/GetLaboratorios.js'
import { SaveLaboratorio } from '../../../application/useCases/Laboratorio/SaveLaboratorio.js'
import { DeleteLaboratorio } from '../../../application/useCases/Laboratorio/DeleteLaboratorio.js'
import { LaboratorioController } from '../controllers/LaboratorioController.js'

export default function createLaboratorioRouter (repository: LaboratorioRepository): Router {
  const router = Router()

  const getUseCase = new GetLaboratorios(repository)
  const saveUseCase = new SaveLaboratorio(repository)
  const deleteUseCase = new DeleteLaboratorio(repository)
  const controller = new LaboratorioController(getUseCase, saveUseCase, deleteUseCase)

  // GET /api/laboratorios
  router.get('/', controller.getAll)

  // POST /api/laboratorios — crea o actualiza
  router.post('/', controller.save)

  // DELETE /api/laboratorios/:id
  router.delete('/:id', controller.delete)

  return router
}
