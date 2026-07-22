import XLSX from 'xlsx'
import { type MateriaModalidad } from '../../../domain/Materia.js'
import { type PlanEstudioParserPort, type ExcelParseResult, type ParsedMateria } from '../../../application/ports/PlanEstudioParserPort.js'

// Maps semester ordinal name to number (supports accented and non-accented variants)
const SEMESTRE_MAP: Record<string, number> = {
  PRIMER: 1,
  PRIMERO: 1,
  PRIMERA: 1,
  I: 1,
  SEGUNDO: 2,
  SEGUNDA: 2,
  II: 2,
  TERCER: 3,
  TERCERO: 3,
  TERCERA: 3,
  III: 3,
  CUARTO: 4,
  CUARTA: 4,
  IV: 4,
  QUINTO: 5,
  QUINTA: 5,
  V: 5,
  SEXTO: 6,
  SEXTA: 6,
  VI: 6,
  SÉPTIMO: 7,
  SEPTIMO: 7,
  SÉPTIMA: 7,
  SEPTIMA: 7,
  VII: 7,
  OCTAVO: 8,
  OCTAVA: 8,
  VIII: 8,
  NOVENO: 9,
  NOVENA: 9,
  IX: 9,
  DÉCIMO: 10,
  DECIMO: 10,
  DÉCIMA: 10,
  DECIMA: 10,
  X: 10,
  UNDÉCIMO: 11,
  UNDECIMO: 11,
  UNDÉCIMA: 11,
  UNDECIMA: 11,
  XI: 11,
  DUODÉCIMO: 12,
  DUODECIMO: 12,
  DUODÉCIMA: 12,
  DUODECIMA: 12,
  XII: 12
}

/**
 * Normaliza la modalidad del Excel al dominio de la BD.
 * PRE, PRE*, SEP, SEP* → 'PRE'
 * VIT, LIN → 'VIT'
 * Cualquier otro valor → 'PRE' (fallback seguro)
 */
function normalizeModalidad (raw: string): MateriaModalidad {
  const upper = raw.toUpperCase().replace(/[*]/g, '').trim()
  if (upper === 'VIT' || upper === 'LIN') return 'VIT'
  return 'PRE'
}

/**
 * Intenta detectar el número de semestre a partir del texto de una fila.
 * Soporta:
 *   - Ordinales textuales: "PRIMER SEMESTRE", "TERCER SEMESTRE"
 *   - Romanos: "SEMESTRE I", "SEMESTRE III"
 *   - Dígitos: "SEMESTRE 1", "3er SEMESTRE"
 * Devuelve 0 si no puede determinar el semestre.
 */
function parseSemestreFromText (text: string): number {
  const upper = text.toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .trim()

  if (!upper.includes('SEMESTRE')) return 0

  // Try to extract ordinal word before or after SEMESTRE
  const tokens = upper.split(/\s+/)
  for (const token of tokens) {
    const mapped = SEMESTRE_MAP[token]
    if (mapped !== undefined) return mapped
  }

  // Try plain digit in the string (e.g. "SEMESTRE 3", "3er SEMESTRE")
  const digitMatch = upper.match(/\b(\d{1,2})\b/)
  if (digitMatch !== null) {
    const n = parseInt(digitMatch[1], 10)
    if (n >= 1 && n <= 12) return n
  }

  return 0
}

/**
 * Detecta si una fila es un encabezado de semestre.
 * Criterio amplio: cualquier celda visible que contenga la palabra "SEMESTRE"
 * y la materia (col[2]) esté vacía.
 */
function isSemestreHeader (row: unknown[]): boolean {
  const col2 = String(row[2] ?? '').trim()
  if (col2 !== '') return false // Has a subject name → not a header

  const colTexts = [String(row[0] ?? ''), String(row[1] ?? '')]
  return colTexts.some(t => t.toUpperCase().includes('SEMESTRE'))
}

/**
 * Líneas que indican ruido real del Excel (totales, leyendas, notas al pie).
 * Se descartan aunque tengan texto en columnas de materia.
 */
const NOISE_PATTERNS = [
  /total\s+hr/i,
  /^\s*leyenda/i,
  /^\s*[üu]\s/i, // bullet character "ü" used in legend
  /consejo\s+universitario/i,
  /^\s*\*{1,3}\s+el\s+estudiante/i,
  /^\s*c\*:/i,
  /^\s*pre\*:/i,
  /^\s*sep\*:/i
]

function isNoiseLine (row: unknown[]): boolean {
  const allText = row.map(c => String(c ?? '')).join(' ').trim()
  if (allText === '') return true
  return NOISE_PATTERNS.some(p => p.test(allText))
}

/**
 * Genera un código de materia a partir de su nombre cuando no hay código explícito.
 * Usa las primeras letras de cada palabra (máx. 6 chars) + un contador para unicidad.
 */
function generateCode (nombre: string, counter: number): string {
  const initials = nombre
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(w => w.slice(0, 2))
    .join('')
    .slice(0, 6)
  return `${initials}${counter}`
}

/**
 * Regla de negocio: detecta materias no permitidas en el Plan de Estudio.
 * Normaliza el nombre eliminando diacríticos para ser tolerante a variaciones
 * ortográficas del Excel (ej. "Pasantías", "Pasantía Profesional", "Pasantias").
 */
function isExcludedMateria (nombre: string): boolean {
  const normalizado = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const excludedKeywords = [
    'pasantia',
    'servicio comunitario',
    'electiva (informatica) ii',
    'electiva (complementaria)',
    'trabajo de grado',
    'electiva (informatica) i'
  ]

  return excludedKeywords.some(keyword => normalizado.includes(keyword))
}

/**
 * Encuentra la primera hoja del libro que contenga datos de materias.
 * Intenta por nombre exacto primero, luego por coincidencia parcial, luego la primera hoja.
 */
function findSheet (wb: XLSX.WorkBook): XLSX.WorkSheet {
  const preferredNames = ['INGENIERÍA INFORMÁTICA', 'INGENIERIA INFORMATICA']
  for (const name of preferredNames) {
    if (wb.Sheets[name] !== undefined) return wb.Sheets[name]
  }

  // Partial match (case-insensitive, diacritic-insensitive)
  const normalize = (s: string): string =>
    s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const match = wb.SheetNames.find(n => normalize(n).includes('INFORM'))
  if (match !== undefined) return wb.Sheets[match]

  // Fall back to first sheet
  return wb.Sheets[wb.SheetNames[0]]
}

/**
 * Parsea el buffer de un archivo Excel de Plan de Estudio y devuelve las materias y
 * sus prerrequisitos en forma de nombres a resolver posteriormente.
 *
 * Criterios para detectar una fila de materia (flexibles):
 *  1. La fila no es ruido (totales, leyenda, notas al pie).
 *  2. La fila no es un encabezado de semestre.
 *  3. La columna de nombre (col[2]) contiene texto no vacío.
 *  4. La materia no está excluida por regla de negocio (ej. Pasantías).
 *  5. Se está dentro de un semestre (semestreActual > 0).
 *
 * El código (col[1]) puede ser:
 *  - 5 dígitos numéricos: "02003"
 *  - Alfanumérico: "CUSC", "IISC", "IILTG"
 *  - Vacío / asteriscos: se genera automáticamente desde el nombre
 */
export function parseExcelPlanEstudio (buffer: Buffer): ExcelParseResult {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const ws = findSheet(wb)

  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

  const materias: ParsedMateria[] = []
  let semestreActual = 0
  let skipped = 0
  let generatedCounter = 0

  // Data starts at row index 5 (0-indexed) — first rows are title/header of the table
  for (let i = 5; i < rows.length; i++) {
    const row = rows[i]

    // 1. Skip genuine noise lines (legend, totals, empty)
    if (isNoiseLine(row)) {
      skipped++
      continue
    }

    // 2. Detect semester headers and update current semester
    if (isSemestreHeader(row)) {
      const headerText = [String(row[0] ?? ''), String(row[1] ?? '')].join(' ')
      const n = parseSemestreFromText(headerText)
      if (n > 0) semestreActual = n
      continue
    }

    // 3. A materia row requires a non-empty name in col[2]
    const nombre = String(row[2] ?? '').trim()
    if (nombre === '') {
      skipped++
      continue
    }

    // 4. Must be inside a semester block
    if (semestreActual === 0) {
      skipped++
      continue
    }

    // 5. Exclude business-rule materias (e.g. Pasantías)
    if (isExcludedMateria(nombre)) {
      skipped++
      continue
    }

    // Build a unique code combining escuela prefix (col[0]) + course number (col[1]).
    // This is necessary because the numeric code alone is NOT unique across departments:
    // e.g. FING/02003 = "Cálculo Diferencial" vs INFO/02003 = "Prog. Orientada a Objetos".
    const escuelaPrefix = String(row[0] ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const rawCode = String(row[1] ?? '').trim()
    const isRealCode = rawCode !== '' && !/^\*+$/.test(rawCode)

    let codMateria: string
    if (isRealCode && escuelaPrefix !== '') {
      // Combine: "FING-02003", "INFO-02001", "UCAB-00003", etc.
      codMateria = `${escuelaPrefix}-${rawCode}`.slice(0, 40)
    } else if (isRealCode) {
      // No school prefix available — use number alone
      codMateria = rawCode.slice(0, 40)
    } else {
      // No numeric code (electivas, cursos especiales) — generate from name
      generatedCounter++
      codMateria = generateCode(nombre, generatedCounter)
    }

    // Skip if another materia already has this same code (dedup)
    if (materias.some(m => m.codMateria === codMateria)) {
      skipped++
      continue
    }

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

export class ExcelPlanEstudioParserAdapter implements PlanEstudioParserPort {
  parse (buffer: Buffer): ExcelParseResult {
    return parseExcelPlanEstudio(buffer)
  }
}
