export type ExportFormat = 'excel' | 'pdf'
export type ExportScope = 'current_semester' | 'all_semesters'

export interface ScheduleExportConfig {
  format: ExportFormat
  scope: ExportScope
  selectedSemester: number
  termName?: string
}
