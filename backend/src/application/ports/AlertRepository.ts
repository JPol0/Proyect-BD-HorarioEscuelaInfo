import { type Alert } from '../../domain/Alert.js'

export interface AlertRepository {
  getAllAlerts: (term: string) => Promise<Alert[]>
  save: (term: string, alert: Alert) => Promise<void>
}
