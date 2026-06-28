import type { WeeklySchedule } from '../../domain/WeeklySchedule'

export interface WeeklyScheduleRepository {
  getScheduleByTerm: (term: string) => Promise<WeeklySchedule>
}
