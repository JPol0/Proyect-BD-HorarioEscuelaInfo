import { Router } from 'express'
import { MockMateriaRepository } from '../../database/MockMateriaRepository.js'
import { GetMaterias } from '../../../application/useCases/Materia/GetMaterias.js'
import { SaveMateria } from '../../../application/useCases/Materia/SaveMateria.js'
import { DeleteMateria } from '../../../application/useCases/Materia/DeleteMateria.js'
import { MateriaController } from '../controllers/MateriaController.js'

const router = Router()

// Inyección manual de dependencias siguiendo la arquitectura limpia
const repository = new MockMateriaRepository()
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

export default router
