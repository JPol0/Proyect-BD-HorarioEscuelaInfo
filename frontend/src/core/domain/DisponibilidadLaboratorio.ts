import { type DiaSemana } from './DisponibilidadHoraria'

export interface DisponibilidadLaboratorio {
  idLaboratorio: string
  codTerm: string
  dia: DiaSemana
  hora: string // Ej: "07:00"
  ocupado: boolean
}
