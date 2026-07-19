export type ProfesorStatus = 'A' | 'ER' | 'R'

export interface Profesor {
  cedula: string
  nombre: string
  status: ProfesorStatus
}
