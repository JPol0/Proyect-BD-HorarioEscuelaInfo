import { type Request, type Response } from 'express'
import { type GuardarPrerequito } from '../../../application/useCases/Prerequito/GuardarPrerequito.js'
import { type EliminarPrerequito } from '../../../application/useCases/Prerequito/EliminarPrerequito.js'
import { type ObtenerPrerequitosPorTerm } from '../../../application/useCases/Prerequito/ObtenerPrerequitosPorTerm.js'
import { type ObtenerPrerequitosPorMateria } from '../../../application/useCases/Prerequito/ObtenerPrerequitosPorMateria.js'
import { type Prerequito } from '../../../domain/Prerequito.js'

export class PrerequitoController {
  constructor (
    private readonly guardarUseCase: GuardarPrerequito,
    private readonly eliminarUseCase: EliminarPrerequito,
    private readonly obtenerPorTermUseCase: ObtenerPrerequitosPorTerm,
    private readonly obtenerPorMateriaUseCase: ObtenerPrerequitosPorMateria
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    try {
      const term = typeof req.query.term === 'string' ? req.query.term : ''
      const materia = typeof req.query.materia === 'string' ? req.query.materia : ''

      if (term.trim() === '') {
        res.status(400).json({ error: 'El parámetro term es obligatorio' })
        return
      }

      if (materia.trim() !== '') {
        const result = await this.obtenerPorMateriaUseCase.execute(materia, term)
        res.json(result)
      } else {
        const result = await this.obtenerPorTermUseCase.execute(term)
        res.json(result)
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(500).json({ error: mensaje })
    }
  }

  save = async (req: Request, res: Response): Promise<void> => {
    try {
      const prerequitoData = req.body as Prerequito
      await this.guardarUseCase.execute(prerequitoData)
      res.status(201).json({ ok: true, message: 'Prerrequisito guardado correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigoAsignatura, codigoTermAsignatura, codigoAsignaturaPrerequito, codigoTermPrerequito } = req.body as {
        codigoAsignatura: string
        codigoTermAsignatura: string
        codigoAsignaturaPrerequito: string
        codigoTermPrerequito: string
      }

      await this.eliminarUseCase.execute(
        codigoAsignatura,
        codigoTermAsignatura,
        codigoAsignaturaPrerequito,
        codigoTermPrerequito
      )
      res.json({ ok: true, message: 'Prerrequisito eliminado correctamente' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(400).json({ error: mensaje })
    }
  }
}
