export type DiaSemana = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes'

export type NivelDisponibilidad = 0 | 1 | 2

export interface DisponibilidadHoraria {
  cedulaProfesor: string
  codTerm: string
  dia: DiaSemana
  numeroModulo: number
  disponibilidad: NivelDisponibilidad
  ocupado: boolean
  materiaAsignada: string | null
}

export const DIAS_SEMANA: DiaSemana[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']

export interface ModuloHorario {
  numeroModulo: number
  horaInicio: string
}

/**
 * 12 módulos horarios (07:00 a 18:00) usados para la grilla visual de
 * disponibilidad. El reglamento UCAB define módulos 1-7 para el dictado
 * regular de clases; aquí se numeran 1-12 para cubrir el rango horario
 * completo mostrado en la pantalla de carga de disponibilidad.
 */
export const MODULOS_HORARIO: ModuloHorario[] = [
  { numeroModulo: 1, horaInicio: '07:00' },
  { numeroModulo: 2, horaInicio: '08:00' },
  { numeroModulo: 3, horaInicio: '09:00' },
  { numeroModulo: 4, horaInicio: '10:00' },
  { numeroModulo: 5, horaInicio: '11:00' },
  { numeroModulo: 6, horaInicio: '12:00' },
  { numeroModulo: 7, horaInicio: '13:00' },
  { numeroModulo: 8, horaInicio: '14:00' },
  { numeroModulo: 9, horaInicio: '15:00' },
  { numeroModulo: 10, horaInicio: '16:00' },
  { numeroModulo: 11, horaInicio: '17:00' },
  { numeroModulo: 12, horaInicio: '18:00' }
]
