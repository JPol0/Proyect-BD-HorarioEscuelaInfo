import { WeeklyScheduleRepository } from '../ports/WeeklyScheduleRepository.js';
import { WeeklySchedule } from '../../domain/WeeklySchedule.js';

export class GetWeeklySchedule {
  constructor(private readonly repository: WeeklyScheduleRepository) {}

  async execute(term: string): Promise<WeeklySchedule | null> {
    return await this.repository.getScheduleByTerm(term);
  }
}