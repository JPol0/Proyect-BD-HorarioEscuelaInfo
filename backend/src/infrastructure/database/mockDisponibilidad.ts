import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria.js'
import { DIAS_SEMANA, MODULOS_HORARIO } from '../../domain/DisponibilidadHoraria.js'

export const mockDisponibilidad: DisponibilidadHoraria[] = DIAS_SEMANA.flatMap((dia) =>
  MODULOS_HORARIO.map((modulo) => ({
    cedulaProfesor: 'V-12345678',
    codTerm: '202615',
    dia,
    numeroModulo: modulo.numeroModulo,
    disponibilidad: 0,
    ocupado: false,
    materiaAsignada: null
  }))
)
