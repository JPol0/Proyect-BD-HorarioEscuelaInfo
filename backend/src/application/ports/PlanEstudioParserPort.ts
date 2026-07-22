import { type Materia } from '../../domain/Materia.js'

export interface ParsedMateria extends Materia {
  prereqNombres: string[]
}

export interface ExcelParseResult {
  materias: ParsedMateria[]
  skipped: number
}

export interface PlanEstudioParserPort {
  parse: (buffer: Buffer) => ExcelParseResult
}
