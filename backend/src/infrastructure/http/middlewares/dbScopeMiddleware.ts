import { type Response, type NextFunction } from 'express'
import { type AuthenticatedRequest } from './authMiddleware.js'
import { dbContext, adminPool, lectorPool } from '../../database/postgre/db.js'

/**
 * Middleware que intercepta las peticiones HTTP y configura el pool de conexiones
 * adecuado según el rol verificado del token del usuario (req.user?.rol).
 * Por defecto usa el lectorPool si no se especifica o si no se ha autenticado.
 */
export function dbScopeMiddleware (req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const userRole = req.user?.rol

  // Determinamos el pool según el rol verificado en el token.
  // Por defecto limitamos el acceso a lector si no se provee o no es válido.
  const activePool = userRole === 'administrador' ? adminPool : lectorPool

  // Ejecutamos todo el flujo de la petición dentro del contexto del pool seleccionado
  dbContext.run(activePool, () => {
    next()
  })
}
