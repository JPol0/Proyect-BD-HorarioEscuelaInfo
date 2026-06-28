import { Request, Response } from 'express';
import { GetWeeklySchedule } from '../../../application/useCases/GetWeeklySchedule.js';

export class WeeklyScheduleController {
  constructor(private readonly getWeeklySchedule: GetWeeklySchedule) {}

  async getSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { term } = req.query;
      if (typeof term !== 'string') {
        res.status(400).json({ message: 'Term parameter is required' });
        return;
      }
      const schedule = await this.getWeeklySchedule.execute(term);
      if (!schedule) {
        res.status(404).json({ message: 'Schedule not found for this term' });
        return;
      }
      res.json(schedule);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }
}