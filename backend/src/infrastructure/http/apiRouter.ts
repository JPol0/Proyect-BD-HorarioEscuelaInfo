import { Router } from 'express'
import alertRoutes from './routes/AlertRoutes.js'
import termRoutes from './routes/TermRoutes.js'
import weeklyScheduleRoutes from './routes/WeeklyScheduleRoutes.js'
import { ObtenerDisponibilidadHoraria } from '../../application/use-cases/ObtenerDisponibilidadHoraria.js'
import { GuardarDisponibilidadHoraria } from '../../application/use-cases/GuardarDisponibilidadHoraria.js'
import { ObtenerProfesorActivo } from '../../application/use-cases/ObtenerProfesorActivo.js'
import { MockDisponibilidadRepository } from '../database/MockDisponibilidadRepository.js'
import { MockProfesorRepository } from '../database/MockProfesorRepository.js'
import { DisponibilidadController } from './controllers/DisponibilidadController.js'

const apiRouter = Router()

apiRouter.use('/alerts', alertRoutes)
apiRouter.use('/terms', termRoutes)
apiRouter.use('/weekly-schedule', weeklyScheduleRoutes)

const disponibilidadRepository = new MockDisponibilidadRepository()
const profesorRepository = new MockProfesorRepository()

const obtenerDisponibilidadHoraria = new ObtenerDisponibilidadHoraria(disponibilidadRepository)
const guardarDisponibilidadHoraria = new GuardarDisponibilidadHoraria(disponibilidadRepository)
const obtenerProfesorActivo = new ObtenerProfesorActivo(profesorRepository)

const disponibilidadController = new DisponibilidadController(
  obtenerDisponibilidadHoraria,
  guardarDisponibilidadHoraria,
  obtenerProfesorActivo
)

apiRouter.get('/profesores/:cedula/disponibilidad', disponibilidadController.obtener)
apiRouter.put('/profesores/:cedula/disponibilidad', disponibilidadController.guardar)

export default apiRouter
