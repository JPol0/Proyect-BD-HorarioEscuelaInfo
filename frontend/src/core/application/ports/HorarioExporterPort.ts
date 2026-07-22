import type { Horario } from '../../domain/Horario'
import type { Materia } from '../../domain/Materia'
import type { Imparte } from '../../domain/Imparte'
import type { Profesor } from '../../domain/Profesor'
import type { ScheduleExportConfig } from '../../domain/ScheduleExport'

import type { Laboratorio } from '../../domain/Laboratorio'

export interface HorarioExporterPort {
  exportarExcel: (
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig,
    laboratorios?: Laboratorio[]
  ) => Promise<void> | void

  exportarPdf: (
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig,
    laboratorios?: Laboratorio[]
  ) => Promise<void> | void
}
