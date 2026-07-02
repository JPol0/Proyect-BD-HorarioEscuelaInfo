import { type Request, type Response, type NextFunction } from 'express'
import { dbContext, adminPool, lectorPool } from '../../database/postgre/db.js'

/**
 * Middleware que intercepta las peticiones HTTP y configura el pool de conexiones
 * adecuado según la cabecera 'x-user-role'. Por defecto usa el lectorPool si no se especifica.
 */
export function dbScopeMiddleware (req: Request, res: Response, next: NextFunction): void {
  const roleHeader = req.headers['x-user-role']

  // Determinamos el pool según el rol especificado en los headers.
  // Por defecto limitamos el acceso a lector si no se provee.
  const activePool = roleHeader === 'administrador' ? adminPool : lectorPool

  // Ejecutamos todo el flujo de la petición dentro del contexto del pool seleccionado
  dbContext.run(activePool, () => {
    next()
  })
}
