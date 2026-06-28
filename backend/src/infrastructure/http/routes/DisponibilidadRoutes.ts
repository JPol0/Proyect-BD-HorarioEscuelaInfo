import { Router } from 'express'
import { MockDisponibilidadRepository } from '../../database/MockDisponibilidadRepository.js'
import { MockProfesorRepository } from '../../database/MockProfesorRepository.js'
import { ObtenerDisponibilidadHoraria } from '../../../application/useCases/ObtenerDisponibilidadHoraria.js'
import { GuardarDisponibilidadHoraria } from '../../../application/useCases/GuardarDisponibilidadHoraria.js'
import { ObtenerProfesorActivo } from '../../../application/useCases/ObtenerProfesorActivo.js'
import { DisponibilidadController } from '../controllers/DisponibilidadController.js'

const router = Router()

// Inyección manual de dependencias
const disponibilidadRepository = new MockDisponibilidadRepository()
const profesorRepository = new MockProfesorRepository()
const obtenerUseCase = new ObtenerDisponibilidadHoraria(disponibilidadRepository)
const guardarUseCase = new GuardarDisponibilidadHoraria(disponibilidadRepository)
const obtenerProfesorUseCase = new ObtenerProfesorActivo(profesorRepository)
const controller = new DisponibilidadController(obtenerUseCase, guardarUseCase, obtenerProfesorUseCase)

router.get('/:cedula/disponibilidad', controller.obtener)
router.put('/:cedula/disponibilidad', controller.guardar)

export default router
