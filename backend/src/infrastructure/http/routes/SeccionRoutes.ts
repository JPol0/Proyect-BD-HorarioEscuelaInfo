import { Router } from 'express'
import { type SeccionRepository } from '../../../application/ports/SeccionRepository.js'
import { SeccionController } from '../controllers/SeccionController.js'
import { GetSecciones } from '../../../application/useCases/Secciones/GetSecciones.js'
import { GetSeccion } from '../../../application/useCases/Secciones/GetSeccion.js'
import { SaveSeccion } from '../../../application/useCases/Secciones/SaveSeccion.js'
import { DeleteSeccion } from '../../../application/useCases/Secciones/DeleteSeccion.js'

export default function createSeccionRouter (repository: SeccionRepository): Router {
  const router = Router()

  const getSecciones = new GetSecciones(repository)
  const getSeccion = new GetSeccion(repository)
  const saveSeccion = new SaveSeccion(repository)
  const deleteSeccion = new DeleteSeccion(repository)
  
  const controller = new SeccionController(getSecciones, getSeccion, saveSeccion, deleteSeccion)

  router.get('/', async (req, res) => { await controller.getAll(req, res) })
  router.get('/:nroSeccion', async (req, res) => { await controller.getOne(req, res) })
  router.post('/', async (req, res) => { await controller.save(req, res) })
  router.delete('/:nroSeccion', async (req, res) => { await controller.delete(req, res) })

  return router
}
