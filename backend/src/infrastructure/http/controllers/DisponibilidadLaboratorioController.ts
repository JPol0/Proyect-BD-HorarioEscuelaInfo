import type { Request, Response } from 'express'
import type { ObtenerLaboratorioPorId } from '../../../application/useCases/Laboratorio/ObtenerLaboratorioPorId.js'
import type { ObtenerDisponibilidadLaboratorio } from '../../../application/useCases/Laboratorio/ObtenerDisponibilidadLaboratorio.js'
import type { GuardarDisponibilidadLaboratorio } from '../../../application/useCases/Laboratorio/GuardarDisponibilidadLaboratorio.js'

export class DisponibilidadLaboratorioController {
  constructor(
    private readonly obtenerLaboratorioPorIdUseCase: ObtenerLaboratorioPorId,
    private readonly obtenerDisponibilidadLaboratorioUseCase: ObtenerDisponibilidadLaboratorio,
    private readonly guardarDisponibilidadLaboratorioUseCase: GuardarDisponibilidadLaboratorio
  ) { }

  obtener = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'El ID del laboratorio debe ser un número válido' })
        return
      }

      const codTerm = typeof req.query.term === 'string' ? req.query.term : null
      if (codTerm === null) {
        res.status(400).json({ error: 'El código de término es requerido' })
        return
      }

      const laboratorio = await this.obtenerLaboratorioPorIdUseCase.execute(id)
      const disponibilidad = await this.obtenerDisponibilidadLaboratorioUseCase.execute(id, codTerm)
      res.json({ laboratorio, disponibilidad })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado'
      const status = message.includes('No se encontró el laboratorio') ? 404 : 500
      res.status(status).json({ error: message })
    }
  }

  guardar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'El ID del laboratorio debe ser un número válido' })
        return
      }

      const codTerm = typeof req.query.term === 'string' ? req.query.term : '202615'
      const grilla = req.body

      if (!Array.isArray(grilla)) {
        res.status(400).json({ error: 'El cuerpo de la petición debe ser un arreglo de celdas de disponibilidad' })
        return
      }

      await this.obtenerLaboratorioPorIdUseCase.execute(id)
      await this.guardarDisponibilidadLaboratorioUseCase.execute(id, codTerm, grilla)
      res.json({ ok: true, message: 'Disponibilidad de laboratorio guardada correctamente' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado'
      const status = message.includes('No se encontró el laboratorio') ? 404 : 400
      res.status(status).json({ error: message })
    }
  }
}
