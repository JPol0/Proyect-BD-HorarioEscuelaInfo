import { type Request, type Response } from 'express'
import { type GetTerms } from '../../../application/useCases/Terms/GetTerms.js'
import { type CreateTerm } from '../../../application/useCases/Terms/CreateTerm.js'
import { type ToggleTermArchive } from '../../../application/useCases/Terms/ToggleTermArchive.js'

export class TermController {
  private readonly getUseCase: GetTerms
  private readonly createUseCase: CreateTerm
  private readonly toggleUseCase: ToggleTermArchive

  constructor (
    getUseCase: GetTerms,
    createUseCase: CreateTerm,
    toggleUseCase: ToggleTermArchive
  ) {
    this.getUseCase = getUseCase
    this.createUseCase = createUseCase
    this.toggleUseCase = toggleUseCase
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const terms = await this.getUseCase.execute()
      res.json(terms)
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar los términos del servidor' })
    }
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, startDate, endDate } = req.body as {
        name: string
        startDate: string
        endDate: string
      }
      const term = await this.createUseCase.execute({ name, startDate, endDate })
      res.status(201).json(term)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  toggleArchive = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const { archived } = req.body as { archived: boolean }
      await this.toggleUseCase.execute(id, archived)
      res.json({ ok: true, message: 'Estado del término actualizado' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
