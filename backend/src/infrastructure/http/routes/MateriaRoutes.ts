import { Router } from 'express'
import multer from 'multer'
import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type RImparteRepository } from '../../../application/ports/RImparteRepository.js'
import { type TransactionManager } from '../../../application/ports/TransactionManager.js'
import { type PrerequitoRepository } from '../../../application/ports/PrerequitoRepository.js'
import { GetMaterias } from '../../../application/useCases/Materia/GetMaterias.js'
import { SaveMateria } from '../../../application/useCases/Materia/SaveMateria.js'
import { DeleteMateria } from '../../../application/useCases/Materia/DeleteMateria.js'
import { UploadPlanEstudio } from '../../../application/useCases/Materia/UploadPlanEstudio.js'
import { ClearTermUseCase } from '../../../application/useCases/Terms/ClearTermUseCase.js'
import { ExcelPlanEstudioParserAdapter } from '../adapters/excelPlanEstudioParser.js'
import { MateriaController } from '../controllers/MateriaController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

// Multer con almacenamiento en memoria para procesar el buffer del Excel
const upload = multer({ storage: multer.memoryStorage() })

export default function createMateriaRouter (
  materiaRepository: MateriaRepository,
  imparteRepository: RImparteRepository,
  transactionManager: TransactionManager,
  prerequitoRepository: PrerequitoRepository
): Router {
  const router = Router()

  const parser = new ExcelPlanEstudioParserAdapter()

  const getUseCase = new GetMaterias(materiaRepository)
  const saveUseCase = new SaveMateria(materiaRepository)
  const deleteUseCase = new DeleteMateria(materiaRepository)
  const uploadUseCase = new UploadPlanEstudio(materiaRepository, parser, prerequitoRepository)
  const clearTermUseCase = new ClearTermUseCase(imparteRepository, materiaRepository)

  const controller = new MateriaController(
    getUseCase,
    saveUseCase,
    deleteUseCase,
    uploadUseCase,
    clearTermUseCase,
    transactionManager
  )

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
