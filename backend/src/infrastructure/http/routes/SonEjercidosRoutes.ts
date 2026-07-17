import { Router } from 'express'
import { type RSonEjercidosRepository } from '../../../application/ports/RSonEjercidosRepository.js'
import { GetRelacionesSonEjercidos } from '../../../application/useCases/relacionSonEjercidos/GetRelacionesSonEjercidos.js'
import { GetRelacionesSonEjercidosByMateria } from '../../../application/useCases/relacionSonEjercidos/GetRelacionesSonEjercidosByMateria.js'
import { SaveRelacionSonEjercidos } from '../../../application/useCases/relacionSonEjercidos/SaveRelacionSonEjercidos.js'
import { DeleteRelacionSonEjercidos } from '../../../application/useCases/relacionSonEjercidos/DeleteRelacionSonEjercidos.js'
import { SonEjercidosController } from '../controllers/SonEjercidosController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createSonEjercidosRouter (repository: RSonEjercidosRepository): Router {
  const router = Router()

  const getUseCase = new GetRelacionesSonEjercidos(repository)
  const getByMateriaUseCase = new GetRelacionesSonEjercidosByMateria(repository)
  const saveUseCase = new SaveRelacionSonEjercidos(repository)
  const deleteUseCase = new DeleteRelacionSonEjercidos(repository)

  const controller = new SonEjercidosController(getUseCase, getByMateriaUseCase, saveUseCase, deleteUseCase)

  // GET /api/relacion-son-ejercidos
  router.get('/', controller.get)

  // POST /api/relacion-son-ejercidos - Guarda o actualiza (requiere admin)
  router.post('/', requireAdmin, controller.save)

  // DELETE /api/relacion-son-ejercidos - Elimina (requiere admin)
  router.delete('/', requireAdmin, controller.delete)

  return router
}
