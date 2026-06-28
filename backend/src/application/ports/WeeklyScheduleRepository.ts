import { WeeklySchedule } from '../../domain/WeeklySchedule.js';

export interface WeeklyScheduleRepository {
  getScheduleByTerm(term: string): Promise<WeeklySchedule | null>;
}
