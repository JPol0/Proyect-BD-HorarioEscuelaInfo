import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../../security/tokenService.js'

export interface AuthenticatedRequest extends Request {
  user?: { nombre: string, rol: string }
}

export function authenticateToken (req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // Expects format: Bearer <token>

  if (token === undefined) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' })
    return
  }

  const decoded = verifyToken(token)
  if (decoded === null) {
    res.status(403).json({ error: 'Token inválido o expirado.' })
    return
  }

  req.user = decoded
  next()
}

export function requireAdmin (req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.rol !== 'administrador') {
    res.status(403).json({ error: 'Permisos insuficientes. Se requiere rol de administrador.' })
    return
  }
  next()
}
