import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../../security/tokenService.js'

export interface AuthenticatedRequest extends Request {
  user?: { nombre: string, rol: string }
}

function parseCookies (cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {}
  if (cookieHeader === undefined || cookieHeader === '') return list
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=')
    const key = parts.shift()?.trim()
    if (key !== undefined && key !== '') {
      list[key] = decodeURIComponent(parts.join('='))
    }
  })
  return list
}

export function authenticateToken (req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies.token

  if (token === undefined) {
    res.status(401).json({ error: 'Acceso denegado. Sesión no iniciada.' })
    return
  }

  const decoded = verifyToken(token)
  if (decoded === null) {
    res.status(403).json({ error: 'Sesión inválida o expirada.' })
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
