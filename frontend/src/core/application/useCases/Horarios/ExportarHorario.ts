import type { HorarioExporterPort } from '../../ports/HorarioExporterPort'
import type { Horario } from '../../../domain/Horario'
import type { Materia } from '../../../domain/Materia'
import type { Imparte } from '../../../domain/Imparte'
import type { Profesor } from '../../../domain/Profesor'
import type { ScheduleExportConfig } from '../../../domain/ScheduleExport'

import type { Laboratorio } from '../../../domain/Laboratorio'

export class ExportarHorario {
  private readonly exporterPort: HorarioExporterPort

  constructor (exporterPort: HorarioExporterPort) {
    this.exporterPort = exporterPort
  }

  async execute (
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig,
    laboratorios?: Laboratorio[]
  ): Promise<void> {
    if (config.format === 'excel') {
      await this.exporterPort.exportarExcel(
        tuplas,
        materias,
        relaciones,
        profesores,
        config,
        laboratorios
      )
    } else {
      await this.exporterPort.exportarPdf(
        tuplas,
        materias,
        relaciones,
        profesores,
        config,
        laboratorios
      )
    }
  }
}
