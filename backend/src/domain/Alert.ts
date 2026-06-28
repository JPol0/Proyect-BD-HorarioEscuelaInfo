export type AlertState = 'PENDIENTE' | 'RESUELTA' | 'IGNORADA'

export interface Alert {
  id: string
  titulo: string
  estado: AlertState
  descripcion?: string
  motivoCambio?: string
}
