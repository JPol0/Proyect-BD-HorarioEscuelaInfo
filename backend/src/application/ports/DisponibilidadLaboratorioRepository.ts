import type { DisponibilidadLaboratorio } from '../../domain/DisponibilidadLaboratorio.js'

export interface DisponibilidadLaboratorioRepository {
  obtenerPorLaboratorioYTerm: (idLaboratorio: number, codTerm: string) => Promise<DisponibilidadLaboratorio[]>
  eliminarPorLaboratorioYTerm: (idLaboratorio: number, codTerm: string) => Promise<void>
  guardar: (idLaboratorio: number, codTerm: string, disponibilidad: DisponibilidadLaboratorio[]) => Promise<void>
}
