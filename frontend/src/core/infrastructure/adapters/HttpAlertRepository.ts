import { type AlertRepository } from '../../application/ports/AlertRepository'
import { type Alerta } from '../../domain/Alarm'
import { API_CONFIG } from '../config/api'

export class HttpAlertRepository implements AlertRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/alerts`

  async getAllAlarms (term: string): Promise<Alerta[]> {
    const response = await fetch(`${this.apiUrl}?term=${term}`)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de horarios')
    }
    return await response.json() as Alerta[]
  }

  async save (term: string, alert: Alerta): Promise<void> {
    const response = await fetch(`${this.apiUrl}?term=${encodeURIComponent(term)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alert)
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al procesar la solicitud en el servidor')
    }
  }
}
