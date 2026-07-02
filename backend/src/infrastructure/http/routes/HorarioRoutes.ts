import { Router } from 'express'
import { type HorarioRepository } from '../../../application/ports/HorarioRepository.js'
import { HorarioController } from '../controllers/HorarioController.js'
import { ObtenerHorario } from '../../../application/useCases/Horarios/ObtenerHorario.js'
import { GuardarHorario } from '../../../application/useCases/Horarios/GuardarHorario.js'

export default function createHorarioRouter (repository: HorarioRepository): Router {
  const router = Router()

  const obtenerHorario = new ObtenerHorario(repository)
  const guardarHorario = new GuardarHorario(repository)
  const controller = new HorarioController(obtenerHorario, guardarHorario)

  router.get('/', async (req, res) => { await controller.getSchedule(req, res) })
  router.post('/', async (req, res) => { await controller.saveSchedule(req, res) })

  return router
}
