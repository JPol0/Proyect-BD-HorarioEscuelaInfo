import { Router } from 'express'
import alertRoutes from './routes/AlertRoutes.js'
import termRoutes from './routes/TermRoutes.js'
import weeklyScheduleRoutes from './routes/WeeklyScheduleRoutes.js'

const apiRouter = Router()

apiRouter.use('/alerts', alertRoutes)
apiRouter.use('/terms', termRoutes)
apiRouter.use('/weekly-schedule', weeklyScheduleRoutes)

export default apiRouter
