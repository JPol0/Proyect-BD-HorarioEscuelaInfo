import type { WeeklyScheduleRepository } from '../../application/ports/WeeklyScheduleRepository'
import type { WeeklySchedule } from '../../domain/WeeklySchedule'
import { API_CONFIG } from '../config/api'

export class ApiWeeklyScheduleRepository implements WeeklyScheduleRepository {
  private readonly API_BASE = API_CONFIG.BASE_URL

  async getScheduleByTerm (term: string): Promise<WeeklySchedule> {
    const res = await fetch(`${this.API_BASE}/weekly-schedule?term=${term}`)
    if (!res.ok) {
      if (res.status === 404) throw new Error('Horario no encontrado para este semestre')
      throw new Error('Error al obtener el horario semanal')
    }
    return await res.json() as WeeklySchedule
  }
}
