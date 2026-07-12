import XLSX from 'xlsx'
import { type Materia, type MateriaModalidad } from '../../../domain/Materia.js'

// Maps semester ordinal name to number
const SEMESTRE_MAP: Record<string, number> = {
  PRIMER: 1,
  SEGUNDO: 2,
  TERCER: 3,
  CUARTO: 4,
  QUINTO: 5,
  SEXTO: 6,
  SÉPTIMO: 7,
  SEPTIMO: 7,
  OCTAVO: 8,
  NOVENO: 9,
  DÉCIMO: 10,
  DECIMO: 10,
  UNDÉCIMO: 11,
  UNDECIMO: 11,
  DUODÉCIMO: 12,
  DUODECIMO: 12
}

/**
 * Normaliza la modalidad del Excel al dominio de la BD.
 * PRE, PRE*, SEP, SEP* → 'PRE'
 * VIT → 'VIT'
 * Cualquier otro valor → 'PRE' (fallback seguro)
 */
function normalizeModalidad (raw: string): MateriaModalidad {
  const upper = raw.toUpperCase().replace('*', '').trim()
  if (upper === 'VIT') return 'VIT'
  return 'PRE'
}

/**
 * Detecta si una fila es un encabezado de semestre.
 * Criterio: col[0] contiene la palabra "SEMESTRE" y col[1] está vacío.
 */
function isSemestreHeader (row: unknown[]): boolean {
  const col0 = String(row[0] ?? '').toUpperCase().trim()
  const col1 = String(row[1] ?? '').trim()
  return col1 === '' && col0.includes('SEMESTRE')
}

/**
 * Extrae el número de semestre de una fila de encabezado.
 * Ejemplo: "PRIMER SEMESTRE" → 1
 */
function parseSemestreNumber (row: unknown[]): number {
  const text = String(row[0] ?? '').toUpperCase().trim()
  const firstWord = text.split(/\s+/)[0]
  return SEMESTRE_MAP[firstWord] ?? 0
}

/**
 * Detecta si una fila corresponde a una materia válida con código numérico.
 * Criterio: col[1] es un número o string numérico (ej. "02003") y no está vacío.
 */
function isMateriaRow (row: unknown[]): boolean {
  const col1 = String(row[1] ?? '').trim()
  if (col1 === '') return false
  // Must be 5-digit numeric code (e.g. "02003") — reject codes like "IISC", "CUSC", "IILTG"
  return /^\d{5}$/.test(col1)
}

export interface ParsedMateria extends Materia {
  /** Nombres de prerrequisitos tal como aparecen en la columna Pre-Req. (ya separados por +) */
  prereqNombres: string[]
}

export interface ExcelParseResult {
  materias: ParsedMateria[]
  skipped: number
}

/**
 * Parsea el buffer de un archivo Excel de Plan de Estudio y devuelve las materias y
 * sus prerrequisitos en forma de nombres a resolver posteriormente.
 */
export function parseExcelPlanEstudio (buffer: Buffer): ExcelParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = 'INGENIERÍA INFORMÁTICA'
  const ws = wb.Sheets[sheetName]
  if (ws === undefined) {
    throw new Error(`No se encontró la hoja "${sheetName}" en el archivo Excel.`)
  }

  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]

  const materias: ParsedMateria[] = []
  let semestreActual = 0
  let skipped = 0

  // Data starts at row index 5 (0-indexed)
  for (let i = 5; i < rows.length; i++) {
    const row = rows[i]

    if (isSemestreHeader(row)) {
      const n = parseSemestreNumber(row)
      if (n > 0) {
        semestreActual = n
      }
      continue
    }

    if (!isMateriaRow(row)) {
      skipped++
      continue
    }

    if (semestreActual === 0) {
      // Skip materias before any semester header is found
      skipped++
      continue
    }

    const codMateria = String(row[1]).trim()
    const nombre = String(row[2]).trim()
    const horasTeo = Number(row[3]) || 0
    const horasPrac = Number(row[4]) || 0
    const horasLab = Number(row[5]) || 0
    const modalidadRaw = String(row[12] ?? '').trim()
    const modalidad = normalizeModalidad(modalidadRaw)

    // col[18]: "Común Algunas escuelas" — non-empty means esComun = true
    const comunRaw = String(row[18] ?? '').trim()
    const esComun = comunRaw !== ''

    // col[14]: Pre-Req. — split by '+' and trim
    const prereqRaw = String(row[14] ?? '').trim()
    const prereqNombres: string[] = prereqRaw !== ''
      ? prereqRaw.split('+').map(p => p.trim()).filter(p => p !== '')
      : []

    materias.push({
      codMateria,
      nombre,
      nroSecciones: 1, // Default value; editable post-import
      horasPrac,
      horasTeo,
      horasLab,
      semestre: semestreActual,
      modalidad,
      esComun,
      prereqNombres
    })
  }

  return { materias, skipped }
}
