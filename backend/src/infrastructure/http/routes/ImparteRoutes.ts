import { Router } from 'express'
import { type RImparteRepository } from '../../../application/ports/RImparteRepository.js'
import { GetRelacionesImparte } from '../../../application/useCases/relacionImparte/GetRelacionesImparte.js'
import { GetRelacionesImparteByMateria } from '../../../application/useCases/relacionImparte/GetRelacionesImparteByMateria.js'
import { SaveRelacionImparte } from '../../../application/useCases/relacionImparte/SaveRelacionImparte.js'
import { DeleteRelacionImparte } from '../../../application/useCases/relacionImparte/DeleteRelacionImparte.js'
import { ImparteController } from '../controllers/ImparteController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createImparteRouter (repository: RImparteRepository): Router {
  const router = Router()

  const getUseCase = new GetRelacionesImparte(repository)
  const getByMateriaUseCase = new GetRelacionesImparteByMateria(repository)
  const saveUseCase = new SaveRelacionImparte(repository)
  const deleteUseCase = new DeleteRelacionImparte(repository)

  const controller = new ImparteController(getUseCase, getByMateriaUseCase, saveUseCase, deleteUseCase)

  // GET /api/relacion-imparte
  router.get('/', controller.get)

  // POST /api/relacion-imparte - Guarda o actualiza (requiere admin)
  router.post('/', requireAdmin, controller.save)

  // DELETE /api/relacion-imparte - Elimina (requiere admin)
  router.delete('/', requireAdmin, controller.delete)

  return router
}
