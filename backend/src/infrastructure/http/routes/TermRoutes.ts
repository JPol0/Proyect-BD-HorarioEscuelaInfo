import { Router } from 'express'
import { MockTermRepository } from '../../database/MockTermRepository.js'
import { GetTerms } from '../../../application/useCases/GetTerms.js'
import { CreateTerm } from '../../../application/useCases/CreateTerm.js'
import { ToggleTermArchive } from '../../../application/useCases/ToggleTermArchive.js'
import { TermController } from '../controllers/TermController.js'

const router = Router()

// Inyección manual de dependencias
const repository = new MockTermRepository()
const getUseCase = new GetTerms(repository)
const createUseCase = new CreateTerm(repository)
const toggleUseCase = new ToggleTermArchive(repository)
const controller = new TermController(getUseCase, createUseCase, toggleUseCase)

router.get('/', controller.getAll)
router.post('/', controller.create)
router.patch('/:id/archive', controller.toggleArchive)

export default router
