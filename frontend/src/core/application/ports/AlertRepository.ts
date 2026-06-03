import { type Alerta, type EstadoAlerta } from '../../domain/Alarm'

export interface AlertRepository {
  getAlarmsPending: () => Promise<Alerta[]>
  saveEstate: (id: string, estado: EstadoAlerta, motivo?: string) => Promise<void>
}
