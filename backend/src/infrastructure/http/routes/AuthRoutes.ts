import { Router } from 'express'
import { type UserRepository } from '../../../application/ports/UserRepository.js'
import { Login } from '../../../application/useCases/User/Login.js'
import { AuthController } from '../controllers/AuthController.js'

export default function createAuthRouter (repository: UserRepository): Router {
  const router = Router()

  const loginUseCase = new Login(repository)
  const controller = new AuthController(loginUseCase)

  // POST /api/auth/login
  router.post('/login', controller.login)

  return router
}
