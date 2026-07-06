export type UserRole = 'administrador' | 'lector'

export interface User {
  id: number
  nombre: string
  rol: UserRole
  password?: string
}
