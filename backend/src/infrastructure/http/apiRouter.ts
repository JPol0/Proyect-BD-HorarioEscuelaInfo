import { Router } from 'express'
import alertRoutes from './routes/AlertRoutes.js'
import termRoutes from './routes/TermRoutes.js'
import weeklyScheduleRoutes from './routes/WeeklyScheduleRoutes.js'
import materiaRoutes from './routes/MateriaRoutes.js'

const apiRouter = Router()

apiRouter.use('/alerts', alertRoutes)
apiRouter.use('/terms', termRoutes)
apiRouter.use('/weekly-schedule', weeklyScheduleRoutes)
apiRouter.use('/materias', materiaRoutes)

export default apiRouter
