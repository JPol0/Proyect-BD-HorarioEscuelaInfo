import { Router } from 'express'
import { type UserRepository } from '../../../application/ports/UserRepository.js'
import { GetUsers } from '../../../application/useCases/User/GetUsers.js'
import { SaveUser } from '../../../application/useCases/User/SaveUser.js'
import { UserController } from '../controllers/UserController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

export default function createUserRouter (repository: UserRepository): Router {
  const router = Router()

  const getUsersUseCase = new GetUsers(repository)
  const saveUserUseCase = new SaveUser(repository)
  const controller = new UserController(getUsersUseCase, saveUserUseCase)

  // Both user management routes require admin role (auth check is global)
  router.get('/', requireAdmin, controller.getAll)
  router.post('/', requireAdmin, controller.save)

  return router
}
