import { Router } from 'express'
import { type TermRepository } from '../../../application/ports/TermRepository.js'
import { GetTerms } from '../../../application/useCases/Terms/GetTerms.js'
import { CreateTerm } from '../../../application/useCases/Terms/CreateTerm.js'
import { ToggleTermArchive } from '../../../application/useCases/Terms/ToggleTermArchive.js'
import { DeleteTerm } from '../../../application/useCases/Terms/DeleteTerm.js'
import { TermController } from '../controllers/TermController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createTermRouter (repository: TermRepository): Router {
  const router = Router()

  const getUseCase = new GetTerms(repository)
  const createUseCase = new CreateTerm(repository)
  const toggleUseCase = new ToggleTermArchive(repository)
  const deleteUseCase = new DeleteTerm(repository)
  const controller = new TermController(getUseCase, createUseCase, toggleUseCase, deleteUseCase)

  router.get('/', controller.getAll)
  router.post('/', requireAdmin, controller.create)
  router.patch('/:id/archive', requireAdmin, controller.toggleArchive)
  router.delete('/:id', requireAdmin, controller.delete)

  return router
}
