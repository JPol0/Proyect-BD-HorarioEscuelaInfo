import express from 'express'
<<<<<<< HEAD
import apiRouter from './infrastructure/http/apiRouter.js'

const app = express()
app.disable('x-powered-by') // Por seguridad, no revelamos que usamos Express
=======
import cors from 'cors'
import { apiRouter } from './infrastructure/http/apiRouter'

const app = express()
app.use(cors())
>>>>>>> e4bb991 (Implement availability screen and API mock)
app.use(express.json())

// Middleware de CORS manual (cumpliendo la guía Standard de estilo)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

<<<<<<< HEAD
// Conectamos todas nuestras rutas bajo la raíz /api
=======
>>>>>>> e4bb991 (Implement availability screen and API mock)
app.use('/api', apiRouter)

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`)
})
