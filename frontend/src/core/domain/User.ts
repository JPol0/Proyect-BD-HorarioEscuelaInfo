export interface User {
  id: number
  nombre: string
  rol: 'administrador' | 'lector'
  password?: string
}
