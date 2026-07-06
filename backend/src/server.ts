import express from 'express'
import apiRouter from './infrastructure/http/apiRouter.js'

const app = express()
app.disable('x-powered-by') // Por seguridad, no revelamos que usamos Express
app.use(express.json())

// Middleware de CORS manual (cumpliendo la guía Standard de estilo)
const ALLOWED_ORIGINS = ['http://localhost:5173']

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin !== undefined && origin !== '' && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// Conectamos todas nuestras rutas bajo la raíz /api
app.use('/api', apiRouter)

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`)
})
