export type DaysOfWeek = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes'

export type ScheduleRow = {
  hour: string
} & Record<DaysOfWeek, string>

export interface WeeklySchedule {
  term: string
  semester: string
  periods: Array<{ id: string, label: string }>
  hours: string[]
  schedule: ScheduleRow[]
}
