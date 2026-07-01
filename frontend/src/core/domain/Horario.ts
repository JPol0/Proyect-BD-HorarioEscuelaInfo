export type DaysOfWeek = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo'

export type ScheduleRow = {
  hour: string
} & Record<DaysOfWeek, string>

export interface Horario {
  codAsig: string
  codTerm: string
  nroSeccion: number
  dia: DaysOfWeek
  hora: string // Ej: "07:00"
  semestre: number
  codLaboratorio?: string
}
