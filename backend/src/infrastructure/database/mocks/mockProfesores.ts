import type { Profesor } from '../../../domain/Profesor.js'

export const profesoresMock: Profesor[] = [
  { cedula: 'V-12345678', nombre: 'Carlos Gomez', correo: 'cgomez@ucab.edu', status: 'A' },
  { cedula: 'V-87654321', nombre: 'Maria Rodriguez', correo: 'mrodriguez@ucab.edu', status: 'A' },
  { cedula: 'V-11223344', nombre: 'Jose Perez', correo: 'jperez@ucab.edu', status: 'P' },
  { cedula: 'V-55667788', nombre: 'Ana Martinez', correo: 'amartinez@ucab.edu', status: 'R' },
  { cedula: 'V-99887766', nombre: 'Pedro Lopez', correo: 'plopez@ucab.edu', status: 'A' }
]
