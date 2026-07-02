import express from 'express'
import apiRouter from './infrastructure/http/apiRouter.js'
import { dbScopeMiddleware } from './infrastructure/http/middlewares/dbScopeMiddleware.js'

const app = express()
app.disable('x-powered-by') // Por seguridad, no revelamos que usamos Express
app.use(express.json())

// Middleware de CORS manual (cumpliendo la guía Standard de estilo)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role')
  next()
})

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// Conectamos todas nuestras rutas bajo la raíz /api aplicando el middleware de contexto BD
app.use('/api', dbScopeMiddleware, apiRouter)

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`)
})
