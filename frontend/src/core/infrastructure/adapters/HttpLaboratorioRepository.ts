import { type LaboratorioRepository } from '../../application/ports/LaboratorioRepository'
import { type Laboratorio } from '../../domain/Laboratorio'
import { API_CONFIG } from '../config/api'

export class HttpLaboratorioRepository implements LaboratorioRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/laboratorios`

  async getAll (): Promise<Laboratorio[]> {
    const response = await fetch(this.apiUrl)
    if (!response.ok) {
      throw new Error('Error al recuperar los laboratorios del servidor')
    }
    return await response.json() as Laboratorio[]
  }

  async save (laboratorio: Laboratorio): Promise<void> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(laboratorio)
    })
    if (!response.ok) {
      let errorMessage = 'Error al guardar el laboratorio en el servidor'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch { /* usa el mensaje por defecto */ }
      throw new Error(errorMessage)
    }
  }

  async delete (id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      let errorMessage = 'Error al eliminar el laboratorio en el servidor'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch { /* usa el mensaje por defecto */ }
      throw new Error(errorMessage)
    }
  }
}
