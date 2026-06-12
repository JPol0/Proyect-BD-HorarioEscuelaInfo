import { Router } from 'express'
import alertRoutes from './routes/AlertRoutes.js'
import weeklyScheduleRoutes from './routes/WeeklyScheduleRoutes.js'

const apiRouter = Router()

apiRouter.use('/alerts', alertRoutes)
apiRouter.use('/weekly-schedule', weeklyScheduleRoutes)

export default apiRouter
