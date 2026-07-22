import * as XLSX from 'xlsx'

import type { DiaSemana, NivelDisponibilidad } from '../../domain/DisponibilidadHoraria'
import { DIAS_SEMANA } from '../../domain/DisponibilidadHoraria'

export interface ItemDisponibilidadExcel {
  dia: DiaSemana
  numeroModulo: number
  disponibilidad: NivelDisponibilidad
}

function parseModuloFromHourText (hourText: string, defaultModulo: number): number {
  if (hourText === '') return defaultModulo
  const lower = hourText.toLowerCase()

  if (lower.includes('7:00') && (lower.includes('am') || (!lower.includes('pm') && defaultModulo <= 6))) return 1
  if (lower.includes('8:00') && (lower.includes('am') || (!lower.includes('pm') && defaultModulo <= 6))) return 2
  if (lower.includes('9:00') && (lower.includes('am') || (!lower.includes('pm') && defaultModulo <= 6))) return 3
  if (lower.includes('10:00')) return 4
  if (lower.includes('11:00')) return 5
  if (lower.includes('12:00') || lower.includes('12: 00')) return 6
  if (lower.includes('1:00') || lower.includes('13:00')) return 7
  if (lower.includes('2:00') || lower.includes('14:00')) return 8
  if (lower.includes('3:00') || lower.includes('15:00')) return 9
  if (lower.includes('4:00') || lower.includes('16:00')) return 10
  if (lower.includes('5:00') || lower.includes('17:00')) return 11
  if (lower.includes('6:00') || lower.includes('18:00')) return 12
  if (lower.includes('7:00') && (lower.includes('pm') || defaultModulo >= 12)) return 13
  if (lower.includes('8:00') && (lower.includes('pm') || defaultModulo >= 12)) return 14

  return defaultModulo
}

export function parseDisponibilidadExcel (arrayBuffer: ArrayBuffer): ItemDisponibilidadExcel[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const sheetName = workbook.SheetNames[0]
  if (sheetName == null) {
    throw new Error('El archivo Excel no contiene hojas de trabajo.')
  }

  const worksheet = workbook.Sheets[sheetName]
  if (worksheet == null) {
    throw new Error('No se pudo leer la hoja del archivo Excel.')
  }

  const rawData = XLSX.utils.sheet_to_json<Array<string | number | null | undefined>>(worksheet, { header: 1 })
  if (rawData.length === 0) {
    throw new Error('El archivo Excel está vacío.')
  }

  let headerRowIndex = -1
  const dayColMap: Partial<Record<DiaSemana, number>> = {}

  for (let r = 0; r < rawData.length; r++) {
    const row = rawData[r]
    if (!Array.isArray(row)) continue

    const currentMap: Partial<Record<DiaSemana, number>> = {}
    let foundDaysCount = 0

    row.forEach((cellValue, colIndex) => {
      if (cellValue == null) return
      const strVal = String(cellValue).trim().toLowerCase()
      const normalizedStr = strVal.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      DIAS_SEMANA.forEach((dia) => {
        const diaNormalized = dia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (normalizedStr === diaNormalized) {
          currentMap[dia] = colIndex
          foundDaysCount++
        }
      })
    })

    if (foundDaysCount >= 3) {
      headerRowIndex = r
      Object.assign(dayColMap, currentMap)
      break
    }
  }

  if (headerRowIndex === -1 || Object.keys(dayColMap).length === 0) {
    throw new Error('No se encontró la tabla de disponibilidad en el archivo Excel.')
  }

  const result: ItemDisponibilidadExcel[] = []
  let moduloCounter = 1

  for (let r = headerRowIndex + 1; r < rawData.length && moduloCounter <= 14; r++) {
    const row = rawData[r]
    if (!Array.isArray(row)) continue

    const firstCell = row[0] != null ? String(row[0]).trim() : ''
    const hasAnyValue = row.some((val) => val != null && String(val).trim() !== '')
    if (!hasAnyValue) continue

    const numeroModulo = parseModuloFromHourText(firstCell, moduloCounter)

      ;(Object.keys(dayColMap) as DiaSemana[]).forEach((dia) => {
      const colIdx = dayColMap[dia]
      if (colIdx != null) {
        const val = row[colIdx]
        let numVal: NivelDisponibilidad = 0
        if (typeof val === 'number') {
          numVal = (val === 1 || val === 2) ? val : 0
        } else if (typeof val === 'string' && val.trim() !== '') {
          const parsed = parseInt(val.trim(), 10)
          if (parsed === 1 || parsed === 2) {
            numVal = parsed
          }
        }
        result.push({
          dia,
          numeroModulo,
          disponibilidad: numVal
        })
      }
    })

    moduloCounter++
  }

  if (result.length === 0) {
    throw new Error('No se encontraron datos de disponibilidad válidos en el archivo Excel.')
  }

  return result
}
