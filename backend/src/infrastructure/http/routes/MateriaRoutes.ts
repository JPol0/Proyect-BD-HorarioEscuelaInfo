import { Router } from 'express'
import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { GetMaterias } from '../../../application/useCases/Materia/GetMaterias.js'
import { SaveMateria } from '../../../application/useCases/Materia/SaveMateria.js'
import { DeleteMateria } from '../../../application/useCases/Materia/DeleteMateria.js'
import { MateriaController } from '../controllers/MateriaController.js'

export default function createMateriaRouter (repository: MateriaRepository): Router {
  const router = Router()

  const getUseCase = new GetMaterias(repository)
  const saveUseCase = new SaveMateria(repository)
  const deleteUseCase = new DeleteMateria(repository)
  const controller = new MateriaController(getUseCase, saveUseCase, deleteUseCase)

  // GET /api/materias - Obtiene el universo completo de materias (60-70) para filtros locales
  router.get('/', controller.getAll)

  // POST /api/materias - Procesa el guardado (creación/actualización por código)
  router.post('/', controller.save)

  // DELETE /api/materias/:codMateria - Elimina una materia
  router.delete('/:codMateria', controller.delete)

  return router
}
