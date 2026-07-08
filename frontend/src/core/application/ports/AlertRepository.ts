import { type Alerta } from '../../domain/Alarm'

export interface AlertRepository {
  getAllAlarms: (term: string) => Promise<Alerta[]>
  save: (term: string, alert: Alerta) => Promise<void>
}
