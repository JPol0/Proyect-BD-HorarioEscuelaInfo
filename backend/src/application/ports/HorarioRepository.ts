import { type Horario } from '../../domain/Horario.js'

export interface HorarioRepository {
  getScheduleByTerm: (term: string) => Promise<Horario[] | null>
  saveSchedule: (term: string, schedule: Horario[]) => Promise<void>
}
