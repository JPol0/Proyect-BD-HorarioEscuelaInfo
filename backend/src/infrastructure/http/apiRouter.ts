import { Router } from 'express'
import alertRoutes from './routes/AlertRoutes.js'
import termRoutes from './routes/TermRoutes.js'
import weeklyScheduleRoutes from './routes/WeeklyScheduleRoutes.js'
import disponibilidadRoutes from './routes/DisponibilidadRoutes.js'
import materiaRoutes from './routes/MateriaRoutes.js'
import laboratorioRoutes from './routes/LaboratorioRoutes.js'

const apiRouter = Router()

apiRouter.use('/alerts', alertRoutes)
apiRouter.use('/terms', termRoutes)
apiRouter.use('/weekly-schedule', weeklyScheduleRoutes)
apiRouter.use('/profesores', disponibilidadRoutes)
apiRouter.use('/materias', materiaRoutes)
apiRouter.use('/laboratorios', laboratorioRoutes)

export default apiRouter
