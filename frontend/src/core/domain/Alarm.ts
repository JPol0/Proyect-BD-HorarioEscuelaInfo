export type EstadoAlerta = 'PENDIENTE' | 'RESUELTA' | 'IGNORADA'

export interface Alerta {
  id: string
  titulo: string
  estado: EstadoAlerta
  descripcion?: string
  motivoCambio?: string
}
