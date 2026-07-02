import type { Horario } from '../../domain/Horario'

export interface HorarioRepository {
  getScheduleByTerm: (term: string) => Promise<Horario[]>
  saveSchedule?: (term: string, horario: Horario[]) => Promise<void>
}
