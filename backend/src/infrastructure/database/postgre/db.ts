import pg from 'pg'
import { AsyncLocalStorage } from 'node:async_hooks'

const { Pool } = pg

const commonConfig = {
  host: 'localhost',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? 5432)
}

// Pool para Administrador (usa DB_ADMIN_USER o cae en DB_USER)
export const adminPool = new Pool({
  ...commonConfig,
  user: process.env.DB_ADMIN_USER,
  password: process.env.DB_ADMIN_PASSWORD
})

// Pool para Lector (usa DB_LECTOR_USER o cae en DB_USER)
export const lectorPool = new Pool({
  ...commonConfig,
  user: process.env.DB_LECTOR_USER,
  password: process.env.DB_LECTOR_PASSWORD
})

// Manejo de errores globales para evitar caídas del proceso
adminPool.on('error', (err) => {
  console.error('Error inesperado en el adminPool de Postgres', err)
})

lectorPool.on('error', (err) => {
  console.error('Error inesperado en el lectorPool de Postgres', err)
})

// Contexto asíncrono para almacenar la conexión activa de la petición
export const dbContext = new AsyncLocalStorage<pg.Pool>()

/**
 * Retorna el Pool de conexiones activo del contexto actual de la petición.
 * Si se llama fuera de una petición HTTP, retorna por defecto el adminPool.
 */
export function getPool (): pg.Pool {
  return dbContext.getStore() ?? adminPool
}
