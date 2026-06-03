import { type Alert, type AlertState } from '../../domain/Alert.js'

export interface AlertRepository {
  getAlertsPending: () => Promise<Alert[]>
  saveState: (id: string, estado: AlertState, motivo?: string) => Promise<void>
}
