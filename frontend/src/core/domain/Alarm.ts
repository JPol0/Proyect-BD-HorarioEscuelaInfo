export type EstadoAlerta = 'PENDIENTE' | 'RESUELTA' | 'IGNORADA'

export interface Alerta {
  id: number | null
  titulo: string
  estado: EstadoAlerta
  fecha: string | null
  motivoCambio?: string
}
