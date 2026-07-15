import { type DiaSemana } from './DisponibilidadHoraria'

export interface DisponibilidadLaboratorio {
  idLaboratorio: number
  codTerm: string
  dia: DiaSemana
  hora: string // Ej: "07:00"
  ocupado: boolean
}
