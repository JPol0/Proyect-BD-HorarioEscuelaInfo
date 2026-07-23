import type { DisponibilidadLaboratorio } from '../../domain/DisponibilidadLaboratorio.js'

export interface DisponibilidadLaboratorioRepository {
  obtenerPorLaboratorioYTerm: (idLaboratorio: number, codTerm: string) => Promise<DisponibilidadLaboratorio[]>
  eliminarPorLaboratorioYTerm: (idLaboratorio: number, codTerm: string, tx?: any) => Promise<void>
  guardar: (idLaboratorio: number, codTerm: string, disponibilidad: DisponibilidadLaboratorio[], tx?: any) => Promise<void>
}
