import type { HorarioExporterPort } from '../../ports/HorarioExporterPort'
import type { Horario } from '../../../domain/Horario'
import type { Materia } from '../../../domain/Materia'
import type { Imparte } from '../../../domain/Imparte'
import type { Profesor } from '../../../domain/Profesor'
import type { ScheduleExportConfig } from '../../../domain/ScheduleExport'

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
    config: ScheduleExportConfig
  ): Promise<void> {
    if (config.format === 'excel') {
      await this.exporterPort.exportarExcel(
        tuplas,
        materias,
        relaciones,
        profesores,
        config
      )
    } else {
      await this.exporterPort.exportarPdf(
        tuplas,
        materias,
        relaciones,
        profesores,
        config
      )
    }
  }
}
