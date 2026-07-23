import type { DisponibilidadLaboratorio } from '../../domain/DisponibilidadLaboratorio'

export interface DisponibilidadLaboratorioRepository {
  obtenerPorLaboratorioYTerm: (idLaboratorio: number, codTerm: string) => Promise<DisponibilidadLaboratorio[]>
  guardar: (idLaboratorio: number, codTerm: string, disponibilidad: DisponibilidadLaboratorio[]) => Promise<void>
}
