import { type Request, type Response } from 'express'
import { type Login } from '../../../application/useCases/User/Login.js'

export class AuthController {
  private readonly loginUseCase: Login

  constructor (loginUseCase: Login) {
    this.loginUseCase = loginUseCase
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, password } = req.body as { nombre?: string, password?: string }

      if (nombre === undefined || nombre.trim() === '' || password === undefined || password.trim() === '') {
        res.status(400).json({ error: 'El nombre de usuario y contraseña son obligatorios' })
        return
      }

      const user = await this.loginUseCase.execute(nombre.trim(), password)
      res.json(user)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(401).json({ error: mensaje })
    }
  }
}
