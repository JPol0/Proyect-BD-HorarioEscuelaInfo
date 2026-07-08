export type AlertState = 'PENDIENTE' | 'RESUELTA' | 'IGNORADA'

export interface Alert {
  id: number | null
  titulo: string
  estado: AlertState
  fecha: string | null
  motivoCambio?: string
}
