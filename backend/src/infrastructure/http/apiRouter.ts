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
import createSonEjercidosRouter from './routes/SonEjercidosRoutes.js'
import createSeccionRouter from './routes/SeccionRoutes.js'
import createDisponibilidadLaboratorioRouter from './routes/DisponibilidadLaboratorioRoutes.js'
import createPrerequitoRouter from './routes/PrerequitoRoutes.js'
import { authenticateToken } from './middlewares/authMiddleware.js'
import { dbScopeMiddleware } from './middlewares/dbScopeMiddleware.js'

// Import repository implementations (mocks for now)
import { PgAlertRepository } from '../database/postgre/PgAlertRepository.js'
import { PgTermRepository } from '../database/postgre/PgTermRepository.js'
import { PgDisponibilidadRepository } from '../database/postgre/PgDisponibilidadRepository.js'
import { PgProfesorRepository } from '../database/postgre/PgProfesorRepository.js'
import { PgMateriaRepository } from '../database/postgre/PgMateriaRepository.js'
import { PgLaboratorioRepository } from '../database/postgre/PgLaboratorioRepository.js'
import { PgHorarioRepository } from '../database/postgre/PgHorarioRepository.js'
import { PgUserRepository } from '../database/postgre/PgUserRepository.js'
import { PgRImparteRepository } from '../database/postgre/PgRImparteRepository.js'
import { PgRSonEjercidosRepository } from '../database/postgre/PgRSonEjercidosRepository.js'
import { PgSeccionRepository } from '../database/postgre/PgSeccionRepository.js'
import { PgDisponibilidadLaboratorioRepository } from '../database/postgre/PgDisponibilidadLaboratorioRepository.js'
import { PgTransactionManager } from '../database/postgre/PgTransactionManager.js'
import { PgPrerequitoRepository } from '../database/postgre/PgPrerequitoRepository.js'

const apiRouter = Router()

const transactionManager = new PgTransactionManager()
const prerequitoRepository = new PgPrerequitoRepository()

const alertRepository = new PgAlertRepository()
const disponibilidadRepository = new PgDisponibilidadRepository()
const profesorRepository = new PgProfesorRepository()
const materiaRepository = new PgMateriaRepository()
const laboratorioRepository = new PgLaboratorioRepository()
const horarioRepository = new PgHorarioRepository()
const termRepository = new PgTermRepository()
const userRepository = new PgUserRepository()
const imparteRepository = new PgRImparteRepository()
const sonEjercidosRepository = new PgRSonEjercidosRepository()
const seccionRepository = new PgSeccionRepository()
const disponibilidadLaboratorioRepository = new PgDisponibilidadLaboratorioRepository()

// Wire routes
apiRouter.use('/auth', dbScopeMiddleware, createAuthRouter(userRepository))

// Exigir autenticación para el resto de los endpoints
apiRouter.use(authenticateToken)
apiRouter.use(dbScopeMiddleware)
apiRouter.use('/alerts', createAlertRouter(alertRepository))
apiRouter.use('/terms', createTermRouter(termRepository))
apiRouter.use('/weekly-schedule', createHorarioRouter(horarioRepository))
apiRouter.use('/profesores', createDisponibilidadRouter(disponibilidadRepository, profesorRepository, transactionManager))
apiRouter.use('/materias', createMateriaRouter(materiaRepository, imparteRepository, transactionManager, prerequitoRepository))
apiRouter.use('/laboratorios', createLaboratorioRouter(laboratorioRepository))
apiRouter.use('/users', createUserRouter(userRepository))
apiRouter.use('/relacion-imparte', createImparteRouter(imparteRepository))
apiRouter.use('/relacion-son-ejercidos', createSonEjercidosRouter(sonEjercidosRepository))
apiRouter.use('/secciones', createSeccionRouter(seccionRepository))
apiRouter.use('/laboratorios/:id/disponibilidad', createDisponibilidadLaboratorioRouter(laboratorioRepository, disponibilidadLaboratorioRepository, transactionManager))
apiRouter.use('/prerequitos', createPrerequitoRouter(prerequitoRepository))

export default apiRouter
