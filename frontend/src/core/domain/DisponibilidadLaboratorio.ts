import { type DiaSemana } from './DisponibilidadHoraria'

export interface DisponibilidadLaboratorio {
  idLaboratorio: number
  dia: DiaSemana
  hora: string // Ej: "07:00"
  ocupado: boolean
}
