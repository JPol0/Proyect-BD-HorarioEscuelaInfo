import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria.js'

export interface DisponibilidadRepository {
  obtenerPorProfesorYTerm: (cedulaProfesor: string, codTerm: string) => Promise<DisponibilidadHoraria[]>
  guardar: (cedulaProfesor: string, codTerm: string, disponibilidad: DisponibilidadHoraria[]) => Promise<void>
}
