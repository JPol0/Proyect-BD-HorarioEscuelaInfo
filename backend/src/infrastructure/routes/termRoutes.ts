import { Router } from 'express'
import { JsonTermRepository } from '../repositories/JsonTermRepository.js'
import { GetAllTerms } from '../../application/use-cases/GetAllTerms.js'
import { CreateTerm } from '../../application/use-cases/CreateTerm.js'

const router = Router()
const termRepository = new JsonTermRepository()

// GET /api/terms
router.get('/', async (_req, res) => {
  const useCase = new GetAllTerms(termRepository)
  const terms = await useCase.execute()
  res.json(terms)
})

// POST /api/terms
router.post('/', async (req, res) => {
  try {
    const useCase = new CreateTerm(termRepository)
    const term = await useCase.execute(req.body)
    res.status(201).json(term)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    res.status(400).json({ message })
  }
})

export default router
