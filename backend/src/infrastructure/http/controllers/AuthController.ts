import { type Request, type Response } from 'express'
import { type Login } from '../../../application/useCases/User/Login.js'
import { generateToken } from '../../security/tokenService.js'

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
      const isProd = process.env.NODE_ENV === 'production'

      const user = await this.loginUseCase.execute(nombre.trim(), password)
      const token = generateToken(user.nombre, user.rol)
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 1 día
      })
      res.json({
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno'
      res.status(401).json({ error: mensaje })
    }
  }

  logout = async (_req: Request, res: Response): Promise<void> => {
    const isProd = process.env.NODE_ENV === 'production'

    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/'
    })
    res.json({ ok: true })
  }
}
