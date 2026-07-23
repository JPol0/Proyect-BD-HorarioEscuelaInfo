import { type Response } from 'express'
import { type AuthenticatedRequest } from '../middlewares/authMiddleware.js'
import { type GetUsers } from '../../../application/useCases/User/GetUsers.js'
import { type SaveUser } from '../../../application/useCases/User/SaveUser.js'
import { type DeleteUser } from '../../../application/useCases/User/DeleteUser.js'
import { type User } from '../../../domain/User.js'

export class UserController {
  private readonly getUsersUseCase: GetUsers
  private readonly saveUserUseCase: SaveUser
  private readonly deleteUserUseCase: DeleteUser

  constructor (getUsersUseCase: GetUsers, saveUserUseCase: SaveUser, deleteUserUseCase: DeleteUser) {
    this.getUsersUseCase = getUsersUseCase
    this.saveUserUseCase = saveUserUseCase
    this.deleteUserUseCase = deleteUserUseCase
  }

  getAll = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await this.getUsersUseCase.execute()
      res.json(users)
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar la lista de usuarios.' })
    }
  }

  save = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, nombre, rol, password } = req.body as Partial<User>

      if (nombre === undefined || nombre.trim() === '' || rol === undefined) {
        res.status(400).json({ error: 'El nombre de usuario y rol son obligatorios.' })
        return
      }

      const userToSave: User = {
        id: (id !== undefined && Number(id) > 0) ? Number(id) : (undefined as any),
        nombre: nombre.trim(),
        rol,
        password: password !== undefined && password.trim() !== '' ? password : undefined
      }

      await this.saveUserUseCase.execute(userToSave)
      res.json({ ok: true, message: 'Usuario guardado exitosamente.' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno al guardar usuario'
      res.status(400).json({ error: mensaje })
    }
  }

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      if (id === undefined) {
        res.status(400).json({ error: 'El ID del usuario es requerido.' })
        return
      }

      await this.deleteUserUseCase.execute(Number(id))
      res.json({ ok: true, message: 'Usuario eliminado exitosamente.' })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error interno al eliminar usuario'
      res.status(400).json({ error: mensaje })
    }
  }
}
