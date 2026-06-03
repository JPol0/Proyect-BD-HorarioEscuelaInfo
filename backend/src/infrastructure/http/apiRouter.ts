import { Router } from 'express'
import alertRoutes from './routes/AlertRoutes.js'

const apiRouter = Router()

apiRouter.use('/alerts', alertRoutes)

export default apiRouter
