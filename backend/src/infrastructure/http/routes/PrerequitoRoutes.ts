import { Router } from 'express'
import { type PrerequitoRepository } from '../../../application/ports/PrerequitoRepository.js'
import { GuardarPrerequito } from '../../../application/useCases/Prerequito/GuardarPrerequito.js'
import { EliminarPrerequito } from '../../../application/useCases/Prerequito/EliminarPrerequito.js'
import { ObtenerPrerequitosPorTerm } from '../../../application/useCases/Prerequito/ObtenerPrerequitosPorTerm.js'
import { ObtenerPrerequitosPorMateria } from '../../../application/useCases/Prerequito/ObtenerPrerequitosPorMateria.js'
import { PrerequitoController } from '../controllers/PrerequitoController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createPrerequitoRouter (repository: PrerequitoRepository): Router {
  const router = Router()

  const guardarUseCase = new GuardarPrerequito(repository)
  const eliminarUseCase = new EliminarPrerequito(repository)
  const obtenerPorTermUseCase = new ObtenerPrerequitosPorTerm(repository)
  const obtenerPorMateriaUseCase = new ObtenerPrerequitosPorMateria(repository)

  const controller = new PrerequitoController(
    guardarUseCase,
    eliminarUseCase,
    obtenerPorTermUseCase,
    obtenerPorMateriaUseCase
  )

  router.get('/', controller.get)
  router.post('/', requireAdmin, controller.save)
  router.delete('/', requireAdmin, controller.delete)

  return router
}
