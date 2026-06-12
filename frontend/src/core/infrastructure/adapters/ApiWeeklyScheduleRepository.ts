import type { WeeklyScheduleRepository } from '../../application/ports/WeeklyScheduleRepository';
import type { WeeklySchedule } from '../../domain/WeeklySchedule';

export class ApiWeeklyScheduleRepository implements WeeklyScheduleRepository {
  private readonly API_BASE = 'http://localhost:3000/api';

  async getScheduleByTerm(term: string): Promise<WeeklySchedule> {
    const res = await fetch(`${this.API_BASE}/weekly-schedule?term=${term}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error('Horario no encontrado para este semestre');
      throw new Error('Error al obtener el horario semanal');
    }
    return await res.json() as WeeklySchedule;
  }
}
