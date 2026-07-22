import type { Horario } from '../../domain/Horario'
import type { Materia } from '../../domain/Materia'
import type { Imparte } from '../../domain/Imparte'
import type { Profesor } from '../../domain/Profesor'
import type { ScheduleExportConfig } from '../../domain/ScheduleExport'

export interface HorarioExporterPort {
  exportarExcel(
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig
  ): Promise<void> | void

  exportarPdf(
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig
  ): Promise<void> | void
}
