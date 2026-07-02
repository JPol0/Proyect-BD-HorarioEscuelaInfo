import { Router } from 'express'
import { type TermRepository } from '../../../application/ports/TermRepository.js'
import { GetTerms } from '../../../application/useCases/Terms/GetTerms.js'
import { CreateTerm } from '../../../application/useCases/Terms/CreateTerm.js'
import { ToggleTermArchive } from '../../../application/useCases/Terms/ToggleTermArchive.js'
import { TermController } from '../controllers/TermController.js'

export default function createTermRouter (repository: TermRepository): Router {
  const router = Router()

  const getUseCase = new GetTerms(repository)
  const createUseCase = new CreateTerm(repository)
  const toggleUseCase = new ToggleTermArchive(repository)
  const controller = new TermController(getUseCase, createUseCase, toggleUseCase)

  router.get('/', controller.getAll)
  router.post('/', controller.create)
  router.patch('/:id/archive', controller.toggleArchive)

  return router
}
