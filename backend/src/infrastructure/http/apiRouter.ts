import { Router } from 'express'
import createAlertRouter from './routes/AlertRoutes.js'
import createTermRouter from './routes/TermRoutes.js'
import createDisponibilidadRouter from './routes/DisponibilidadRoutes.js'
import createMateriaRouter from './routes/MateriaRoutes.js'
import createLaboratorioRouter from './routes/LaboratorioRoutes.js'
import createHorarioRouter from './routes/HorarioRoutes.js'

// Import repository implementations (mocks for now)
import { MockAlertRepository } from '../database/mocks/MockAlertRepository.js'
import { MockTermRepository } from '../database/mocks/MockTermRepository.js'
import { MockDisponibilidadRepository } from '../database/mocks/MockDisponibilidadRepository.js'
import { MockProfesorRepository } from '../database/mocks/MockProfesorRepository.js'
import { PgMateriaRepository } from '../database/postgre/PgMateriaRepository.js'
import { MockLaboratorioRepository } from '../database/mocks/MockLaboratorioRepository.js'
import { JsonHorarioRepository } from '../database/mocks/JsonHorarioRepository.js'

const apiRouter = Router()

// Instantiate repositories
const alertRepository = new MockAlertRepository()
const termRepository = new MockTermRepository()
const disponibilidadRepository = new MockDisponibilidadRepository()
const profesorRepository = new MockProfesorRepository()
const materiaRepository = new PgMateriaRepository()
const laboratorioRepository = new MockLaboratorioRepository()
const horarioRepository = new JsonHorarioRepository()

// Wire routes
apiRouter.use('/alerts', createAlertRouter(alertRepository))
apiRouter.use('/terms', createTermRouter(termRepository))
apiRouter.use('/weekly-schedule', createHorarioRouter(horarioRepository))
apiRouter.use('/profesores', createDisponibilidadRouter(disponibilidadRepository, profesorRepository))
apiRouter.use('/materias', createMateriaRouter(materiaRepository))
apiRouter.use('/laboratorios', createLaboratorioRouter(laboratorioRepository))

export default apiRouter
