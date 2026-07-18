import { Router } from 'express'
import { type LaboratorioRepository } from '../../../application/ports/LaboratorioRepository.js'
import { type DisponibilidadLaboratorioRepository } from '../../../application/ports/DisponibilidadLaboratorioRepository.js'
import { type TransactionManager } from '../../../application/ports/TransactionManager.js'
import { ObtenerLaboratorioPorId } from '../../../application/useCases/Laboratorio/ObtenerLaboratorioPorId.js'
import { ObtenerDisponibilidadLaboratorio } from '../../../application/useCases/DisponibilidadLaboratorio/ObtenerDisponibilidadLaboratorio.js'
import { GuardarDisponibilidadLaboratorio } from '../../../application/useCases/DisponibilidadLaboratorio/GuardarDisponibilidadLaboratorio.js'
import { DisponibilidadLaboratorioController } from '../controllers/DisponibilidadLaboratorioController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createDisponibilidadLaboratorioRouter (
  laboratorioRepository: LaboratorioRepository,
  disponibilidadLaboratorioRepository: DisponibilidadLaboratorioRepository,
  transactionManager: TransactionManager
): Router {
  const router = Router({ mergeParams: true }) // mergeParams allows accessing :id if routed from nested routes

  const obtenerLaboratorioPorId = new ObtenerLaboratorioPorId(laboratorioRepository)
  const obtenerDisponibilidadLaboratorio = new ObtenerDisponibilidadLaboratorio(disponibilidadLaboratorioRepository)
  const guardarDisponibilidadLaboratorio = new GuardarDisponibilidadLaboratorio(disponibilidadLaboratorioRepository, transactionManager)

  const controller = new DisponibilidadLaboratorioController(
    obtenerLaboratorioPorId,
    obtenerDisponibilidadLaboratorio,
    guardarDisponibilidadLaboratorio
  )

  // GET /api/laboratorios/:id/disponibilidad
  router.get('/', controller.obtener)

  // PUT /api/laboratorios/:id/disponibilidad
  router.put('/', requireAdmin, controller.guardar)

  return router
}
