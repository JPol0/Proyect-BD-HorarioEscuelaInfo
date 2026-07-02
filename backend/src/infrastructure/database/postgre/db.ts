import pg from 'pg'

const { Pool } = pg

// Creamos un único pool de conexiones para reutilizarlas en toda la aplicación
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? 5432)
})

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente del Pool de Postgres', err)
})
