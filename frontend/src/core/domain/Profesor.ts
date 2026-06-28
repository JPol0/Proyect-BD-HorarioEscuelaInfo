export type ProfesorStatus = 'A' | 'P' | 'R'

export interface Profesor {
  cedula: string
  nombre: string
  correo: string
  status: ProfesorStatus
}
