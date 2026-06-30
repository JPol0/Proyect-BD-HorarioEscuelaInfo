import { HorarioRepository } from '../../ports/HorarioRepository.js';
import { Horario } from '../../../domain/Horario.js';

export class GuardarHorario {
  constructor(private repository: HorarioRepository) {}

  async execute(term: string, schedule: Horario[]): Promise<void> {
    await this.repository.saveSchedule(term, schedule);
  }
}
