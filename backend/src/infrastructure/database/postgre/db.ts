import pg from 'pg'
import { AsyncLocalStorage } from 'node:async_hooks'

const { Pool } = pg

const ssl = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : undefined

const commonConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? 5432),
  ssl
}

// Pool para Administrador (usa DATABASE_URL_ADMIN si existe, o cae en DB_ADMIN_USER/DB_USER)
const adminConfig = process.env.DATABASE_URL_ADMIN
  ? { connectionString: process.env.DATABASE_URL_ADMIN, ssl }
  : {
    ...commonConfig,
    user: process.env.DB_ADMIN_USER ?? process.env.DB_USER,
    password: process.env.DB_ADMIN_PASSWORD ?? process.env.DB_PASSWORD
  }

export const adminPool = new Pool(adminConfig)

// Pool para Lector (usa DATABASE_URL_LECTOR si existe, o cae en DB_LECTOR_USER/DB_USER)
const lectorConfig = (process.env.DATABASE_URL_LECTOR)
  ? { connectionString: process.env.DATABASE_URL_LECTOR, ssl }
  : {
    ...commonConfig,
    user: process.env.DB_LECTOR_USER ?? process.env.DB_USER,
    password: process.env.DB_LECTOR_PASSWORD ?? process.env.DB_PASSWORD
  }

export const lectorPool = new Pool(lectorConfig)

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
export function getPool(): pg.Pool {
  return dbContext.getStore() ?? adminPool
}
