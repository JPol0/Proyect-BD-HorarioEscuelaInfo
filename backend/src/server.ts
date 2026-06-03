import express from 'express'

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`)
})
