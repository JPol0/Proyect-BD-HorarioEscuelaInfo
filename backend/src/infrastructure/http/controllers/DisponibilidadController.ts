import type { Request, Response } from 'express'
import type { ObtenerDisponibilidadHoraria } from '../../../application/use-cases/ObtenerDisponibilidadHoraria'
import type { GuardarDisponibilidadHoraria } from '../../../application/use-cases/GuardarDisponibilidadHoraria'
import type { ObtenerProfesorActivo } from '../../../application/use-cases/ObtenerProfesorActivo'

export class DisponibilidadController {
  constructor (
    private readonly obtenerDisponibilidadHorariaUseCase: ObtenerDisponibilidadHoraria,
    private readonly guardarDisponibilidadHorariaUseCase: GuardarDisponibilidadHoraria,
    private readonly obtenerProfesorActivoUseCase: ObtenerProfesorActivo
  ) {}

  obtener = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cedula } = req.params
      const codTerm = typeof req.query.term === 'string' ? req.query.term : '202615'
      const profesor = await this.obtenerProfesorActivoUseCase.execute(cedula)
      const disponibilidad = await this.obtenerDisponibilidadHorariaUseCase.execute(cedula, codTerm)

      res.json({ profesor, disponibilidad })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado'
      res.status(404).json({ message })
    }
  }

  guardar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cedula } = req.params
      const codTerm = typeof req.query.term === 'string' ? req.query.term : '202615'
      const grilla = req.body

      await this.guardarDisponibilidadHorariaUseCase.execute(cedula, codTerm, grilla)
      res.json({ ok: true, message: 'Disponibilidad guardada' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado'
      res.status(400).json({ message })
    }
  }
}
