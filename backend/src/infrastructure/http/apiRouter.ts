import { Router } from 'express'
import createAlertRouter from './routes/AlertRoutes.js'
import createTermRouter from './routes/TermRoutes.js'
import createDisponibilidadRouter from './routes/DisponibilidadRoutes.js'
import createMateriaRouter from './routes/MateriaRoutes.js'
import createLaboratorioRouter from './routes/LaboratorioRoutes.js'
import createHorarioRouter from './routes/HorarioRoutes.js'
import createAuthRouter from './routes/AuthRoutes.js'
import createUserRouter from './routes/UserRoutes.js'
import createImparteRouter from './routes/ImparteRoutes.js'
import { authenticateToken } from './middlewares/authMiddleware.js'
import { dbScopeMiddleware } from './middlewares/dbScopeMiddleware.js'

// Import repository implementations (mocks for now)
import { PgAlertRepository } from '../database/postgre/PgAlertRepository.js'
import { PgTermRepository } from '../database/postgre/PgTermRepository.js'
import { MockDisponibilidadRepository } from '../database/mocks/MockDisponibilidadRepository.js'
import { MockProfesorRepository } from '../database/mocks/MockProfesorRepository.js'
import { PgMateriaRepository } from '../database/postgre/PgMateriaRepository.js'
import { PgLaboratorioRepository } from '../database/postgre/PgLaboratorioRepository.js'
import { JsonHorarioRepository } from '../database/mocks/JsonHorarioRepository.js'
import { PgUserRepository } from '../database/postgre/PgUserRepository.js'
import { PgRImparteRepository } from '../database/postgre/PgRImparteRepository.js'

const apiRouter = Router()

const alertRepository = new PgAlertRepository()
const disponibilidadRepository = new MockDisponibilidadRepository()
const profesorRepository = new MockProfesorRepository()
const materiaRepository = new PgMateriaRepository()
const laboratorioRepository = new PgLaboratorioRepository()
const horarioRepository = new JsonHorarioRepository()
const termRepository = new PgTermRepository()
const userRepository = new PgUserRepository()
const imparteRepository = new PgRImparteRepository()

// Wire routes
apiRouter.use('/auth', dbScopeMiddleware, createAuthRouter(userRepository))

// Exigir autenticación para el resto de los endpoints
apiRouter.use(authenticateToken)
apiRouter.use(dbScopeMiddleware)
apiRouter.use('/alerts', createAlertRouter(alertRepository))
apiRouter.use('/terms', createTermRouter(termRepository))
apiRouter.use('/weekly-schedule', createHorarioRouter(horarioRepository))
apiRouter.use('/profesores', createDisponibilidadRouter(disponibilidadRepository, profesorRepository))
apiRouter.use('/materias', createMateriaRouter(materiaRepository))
apiRouter.use('/laboratorios', createLaboratorioRouter(laboratorioRepository))
apiRouter.use('/users', createUserRouter(userRepository))
apiRouter.use('/relacion-imparte', createImparteRouter(imparteRepository))

export default apiRouter
