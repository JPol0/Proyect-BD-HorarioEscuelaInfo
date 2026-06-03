import express from 'express'
import cors from 'cors'
import termRoutes from './infrastructure/routes/termRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/terms', termRoutes)

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`)
})
