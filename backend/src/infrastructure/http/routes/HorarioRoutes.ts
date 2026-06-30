import { Router } from 'express'
import { HorarioController } from '../controllers/HorarioController.js'
import { ObtenerHorario } from '../../../application/useCases/useCasesHorarios/ObtenerHorario.js'
import { GuardarHorario } from '../../../application/useCases/useCasesHorarios/GuardarHorario.js'
import { JsonHorarioRepository } from '../../database/JsonHorarioRepository.js'

const router = Router()

const repository = new JsonHorarioRepository()
const obtenerHorario = new ObtenerHorario(repository)
const guardarHorario = new GuardarHorario(repository)
const controller = new HorarioController(obtenerHorario, guardarHorario)

router.get('/', async (req, res) => { await controller.getSchedule(req, res) })
router.post('/', async (req, res) => { await controller.saveSchedule(req, res) })

export default router
