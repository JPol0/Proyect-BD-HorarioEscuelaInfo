import type { HorarioRepository } from '../../application/ports/HorarioRepository'
import type { Horario } from '../../domain/Horario'
import { API_CONFIG } from '../config/api'

export class ApiHorarioRepository implements HorarioRepository {
  private readonly API_BASE = API_CONFIG.BASE_URL

  async getScheduleByTerm (term: string): Promise<Horario[]> {
    const res = await fetch(`${this.API_BASE}/weekly-schedule?term=${term}`)
    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error('Error al obtener el horario semanal')
    }
    return await res.json() as Horario[]
  }

  async saveSchedule (term: string, horario: Horario[]): Promise<void> {
    const res = await fetch(`${this.API_BASE}/weekly-schedule?term=${term}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(horario)
    })

    if (!res.ok) {
      throw new Error('Error al guardar el horario en el servidor')
    }
  }
}
