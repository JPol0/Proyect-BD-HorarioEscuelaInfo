import { Router } from 'express'
import multer from 'multer'
import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { GetMaterias } from '../../../application/useCases/Materia/GetMaterias.js'
import { SaveMateria } from '../../../application/useCases/Materia/SaveMateria.js'
import { DeleteMateria } from '../../../application/useCases/Materia/DeleteMateria.js'
import { UploadPlanEstudio } from '../../../application/useCases/Materia/UploadPlanEstudio.js'
import { MateriaController } from '../controllers/MateriaController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

// Multer con almacenamiento en memoria para procesar el buffer del Excel
const upload = multer({ storage: multer.memoryStorage() })

export default function createMateriaRouter (repository: MateriaRepository): Router {
  const router = Router()

  const getUseCase = new GetMaterias(repository)
  const saveUseCase = new SaveMateria(repository)
  const deleteUseCase = new DeleteMateria(repository)
  const uploadUseCase = new UploadPlanEstudio(repository)
  const controller = new MateriaController(getUseCase, saveUseCase, deleteUseCase, uploadUseCase)

  // GET /api/materias - Obtiene el universo completo de materias (60-70) para filtros locales
  router.get('/', controller.getAll)

  // POST /api/materias - Procesa el guardado (creación/actualización por código)
  router.post('/', requireAdmin, controller.save)

  // POST /api/materias/upload-excel - Carga masiva del Plan de Estudio desde Excel de forma global
  router.post('/upload-excel', requireAdmin, upload.single('file'), controller.uploadExcel)

  // DELETE /api/materias/:codMateria - Elimina una materia
  router.delete('/:codMateria', requireAdmin, controller.delete)

  return router
}
