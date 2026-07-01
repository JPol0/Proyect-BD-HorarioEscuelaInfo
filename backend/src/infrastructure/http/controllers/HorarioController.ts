import { type Request, type Response } from 'express'
import { type ObtenerHorario } from '../../../application/useCases/Horarios/ObtenerHorario.js'
import { type GuardarHorario } from '../../../application/useCases/Horarios/GuardarHorario.js'

export class HorarioController {
  constructor (
    private readonly obtenerHorario: ObtenerHorario,
    private readonly guardarHorario: GuardarHorario
  ) {}

  async getSchedule (req: Request, res: Response): Promise<void> {
    try {
      const { term } = req.query
      if (typeof term !== 'string') {
        res.status(400).json({ message: 'Term parameter is required' })
        return
      }
      const schedule = await this.obtenerHorario.execute(term)
      if (!schedule) {
        res.status(404).json({ message: 'Schedule not found for this term' })
        return
      }
      res.json(schedule)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      res.status(500).json({ message })
    }
  }

  async saveSchedule (req: Request, res: Response): Promise<void> {
    try {
      const schedule = req.body
      if (!Array.isArray(schedule)) {
        res.status(400).json({ message: 'Invalid payload: expected an array' })
        return
      }

      // We need to figure out the term. Let's just extract it from the first element.
      // If it's an empty array, maybe we don't save or just clear it? But we need the term!
      // In the frontend `ApiHorarioRepository`, we POST to /weekly-schedule.
      // We can get term from query parameter or extract from the first element of schedule.
      const term = req.query.term as string || (schedule.length > 0 ? schedule[0].codTerm : null)
      if (!term) {
        res.status(400).json({ message: 'Term query parameter is required to save schedule' })
        return
      }

      await this.guardarHorario.execute(term, schedule)
      res.status(200).json({ message: 'Schedule saved successfully' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      res.status(500).json({ message })
    }
  }
}
