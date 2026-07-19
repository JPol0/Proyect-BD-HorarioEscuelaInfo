import type { Profesor } from '../../../domain/Profesor.js'

export const profesoresMock: Profesor[] = [
  { cedula: 'V-12345678', nombre: 'Carlos Gomez', status: 'A' },
  { cedula: 'V-87654321', nombre: 'Maria Rodriguez', status: 'A' },
  { cedula: 'V-11223344', nombre: 'Jose Perez', status: 'ER' },
  { cedula: 'V-55667788', nombre: 'Ana Martinez', status: 'R' },
  { cedula: 'V-99887766', nombre: 'Pedro Lopez', status: 'A' }
]
