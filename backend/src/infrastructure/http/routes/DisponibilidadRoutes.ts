import { Router } from 'express'
import { type DisponibilidadRepository } from '../../../application/ports/DisponibilidadRepository.js'
import { type ProfesorRepository } from '../../../application/ports/ProfesorRepository.js'
import { type TransactionManager } from '../../../application/ports/TransactionManager.js'
import { ObtenerDisponibilidadHoraria } from '../../../application/useCases/DisponibilidadHoraria/ObtenerDisponibilidadHoraria.js'
import { GuardarDisponibilidadHoraria } from '../../../application/useCases/DisponibilidadHoraria/GuardarDisponibilidadHoraria.js'
import { ObtenerProfesorActivo } from '../../../application/useCases/DisponibilidadHoraria/ObtenerProfesorActivo.js'
import { GetProfesores } from '../../../application/useCases/Profesores/GetProfesores.js'
import { CrearProfesor } from '../../../application/useCases/Profesores/CrearProfesor.js'
import { ActualizarStatusProfesor } from '../../../application/useCases/Profesores/ActualizarStatusProfesor.js'
import { DisponibilidadController } from '../controllers/DisponibilidadController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createDisponibilidadRouter (
  disponibilidadRepository: DisponibilidadRepository,
  profesorRepository: ProfesorRepository,
  transactionManager: TransactionManager
): Router {
  const router = Router()

  const obtenerUseCase = new ObtenerDisponibilidadHoraria(disponibilidadRepository)
  const guardarUseCase = new GuardarDisponibilidadHoraria(disponibilidadRepository, transactionManager)
  const obtenerProfesorUseCase = new ObtenerProfesorActivo(profesorRepository)
  const getProfesoresUseCase = new GetProfesores(profesorRepository)
  const crearProfesorUseCase = new CrearProfesor(profesorRepository)
  const actualizarStatusUseCase = new ActualizarStatusProfesor(profesorRepository)

  const controller = new DisponibilidadController(
    obtenerUseCase,
    guardarUseCase,
    obtenerProfesorUseCase,
    getProfesoresUseCase,
    crearProfesorUseCase,
    actualizarStatusUseCase
  )

  router.get('/', controller.getAll)
  router.post('/', requireAdmin, controller.crear)
  router.patch('/:cedula/status', requireAdmin, controller.actualizarStatus)
  router.get('/:cedula/disponibilidad', controller.obtener)
  router.put('/:cedula/disponibilidad', requireAdmin, controller.guardar)

  return router
}
