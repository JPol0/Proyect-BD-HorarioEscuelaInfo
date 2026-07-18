import { Router } from 'express'
import { type LaboratorioRepository } from '../../../application/ports/LaboratorioRepository.js'
import { type DisponibilidadLaboratorioRepository } from '../../../application/ports/DisponibilidadLaboratorioRepository.js'
import { ObtenerLaboratorioPorId } from '../../../application/useCases/Laboratorio/ObtenerLaboratorioPorId.js'
import { ObtenerDisponibilidadLaboratorio } from '../../../application/useCases/Laboratorio/ObtenerDisponibilidadLaboratorio.js'
import { GuardarDisponibilidadLaboratorio } from '../../../application/useCases/Laboratorio/GuardarDisponibilidadLaboratorio.js'
import { DisponibilidadLaboratorioController } from '../controllers/DisponibilidadLaboratorioController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createDisponibilidadLaboratorioRouter (
  laboratorioRepository: LaboratorioRepository,
  disponibilidadLaboratorioRepository: DisponibilidadLaboratorioRepository
): Router {
  const router = Router({ mergeParams: true }) // mergeParams allows accessing :id if routed from nested routes

  const obtenerLaboratorioPorId = new ObtenerLaboratorioPorId(laboratorioRepository)
  const obtenerDisponibilidadLaboratorio = new ObtenerDisponibilidadLaboratorio(disponibilidadLaboratorioRepository)
  const guardarDisponibilidadLaboratorio = new GuardarDisponibilidadLaboratorio(disponibilidadLaboratorioRepository)

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
