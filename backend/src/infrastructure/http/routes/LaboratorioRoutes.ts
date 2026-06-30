import { Router } from 'express'
import { MockLaboratorioRepository } from '../../database/MockLaboratorioRepository.js'
import { GetLaboratorios } from '../../../application/useCases/useCasesLaboratorio/GetLaboratorios.js'
import { SaveLaboratorio } from '../../../application/useCases/useCasesLaboratorio/SaveLaboratorio.js'
import { DeleteLaboratorio } from '../../../application/useCases/useCasesLaboratorio/DeleteLaboratorio.js'
import { LaboratorioController } from '../controllers/LaboratorioController.js'

const router = Router()

// Inyección manual de dependencias (Arquitectura Hexagonal)
const repository = new MockLaboratorioRepository()
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

export default router
