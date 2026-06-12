import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WeeklyScheduleRepository } from '../../application/ports/WeeklyScheduleRepository.js';
import { WeeklySchedule } from '../../domain/WeeklySchedule.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, './weeklySchedule.json');

export class JsonWeeklyScheduleRepository implements WeeklyScheduleRepository {
  async getScheduleByTerm(term: string): Promise<WeeklySchedule | null> {
    try {
      const raw = await readFile(DATA_PATH, 'utf-8');
      const allSchedules = JSON.parse(raw) as WeeklySchedule[];
      return allSchedules.find(s => s.term === term) || null;
    } catch (err) {
      throw new Error('Error reading weekly schedule data');
    }
  }
}