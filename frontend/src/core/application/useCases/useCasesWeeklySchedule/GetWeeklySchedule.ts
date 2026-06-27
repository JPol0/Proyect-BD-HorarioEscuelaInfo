import type { WeeklyScheduleRepository } from '../../ports/WeeklyScheduleRepository'
import type { WeeklySchedule } from '../../../domain/WeeklySchedule'

export class GetWeeklySchedule {
  private readonly repository: WeeklyScheduleRepository
  constructor (repository: WeeklyScheduleRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<WeeklySchedule> {
    return await this.repository.getScheduleByTerm(term)
  }
}
