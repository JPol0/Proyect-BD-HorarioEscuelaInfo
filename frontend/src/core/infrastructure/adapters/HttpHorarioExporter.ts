import XLSX from 'xlsx-js-style'
import type { HorarioExporterPort } from '../../application/ports/HorarioExporterPort'
import type { Horario, DaysOfWeek } from '../../domain/Horario'
import type { Materia } from '../../domain/Materia'
import type { Imparte } from '../../domain/Imparte'
import type { Profesor } from '../../domain/Profesor'
import type { ScheduleExportConfig } from '../../domain/ScheduleExport'

// Paleta de colores neutra alternando Azul suave y Gris (Hexadecimal sin '#')
const blueTheme = { bg: 'F0F9FF', text: '0369A1', semBg: 'BAE6FD' } // Azul suave
const grayTheme = { bg: 'F1F5F9', text: '334155', semBg: 'CBD5E1' } // Gris neutro

const semesterColors: Record<number, { bg: string, text: string, semBg: string }> = {
  1: blueTheme,
  2: grayTheme,
  3: blueTheme,
  4: grayTheme,
  5: blueTheme,
  6: grayTheme,
  7: blueTheme,
  8: grayTheme
}

export class HttpHorarioExporter implements HorarioExporterPort {
  exportarExcel (
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig
  ): void {
    const profMap = new Map<string, string>()
    profesores.forEach(p => profMap.set(p.cedula, p.nombre))

    const termName = config.termName ?? 'HORARIO'
    const semestresTotales = Array.from(new Set(materias.map(m => m.semestre))).sort((a, b) => a - b)
    const semestres = config.scope === 'current_semester'
      ? [config.selectedSemester]
      : (semestresTotales.length > 0 ? semestresTotales : [config.selectedSemester])

    const dias: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

    const dataRows: Array<Array<string>> = []
    const rowSemestres: number[] = []
    const merges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } } // Fila 0: Título principal (A1:J1)
    ]

    // Fila 0: Título principal
    dataRows.push([`HORARIO ING. INFORMÁTICA ${termName.toUpperCase()}`])

    // Fila 1: Encabezados de tabla
    dataRows.push(['SEM', 'PROFESOR', 'ASIGNATURA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'])

    let currentRowIndex = 2 // r=0 es título, r=1 es encabezado

    for (const sem of semestres) {
      const semTag = `${sem.toString().padStart(2, '0')}SE`
      const materiasSem = materias.filter(m => m.semestre === sem)
      const semStartRow = currentRowIndex

      for (const mat of materiasSem) {
        const relsMat = relaciones.filter(r => r.codAsig === mat.codMateria)
        const nroSecciones = Math.max(mat.nroSecciones || 1, relsMat.length > 0 ? Math.max(...relsMat.map(r => r.nroSeccion)) : 1)

        // Agrupar secciones que comparten profesor y horario idéntico
        const sectionGroups: Array<{
          secciones: number[]
          profNombre: string
          tuplasMatSec: Horario[]
          scheduleKey: string
        }> = []

        for (let sec = 1; sec <= nroSecciones; sec++) {
          const relSec = relsMat.find(r => r.nroSeccion === sec)
          let profNombre = 'Por Asignar'
          if (relSec?.cedulaP) {
            profNombre = profMap.get(relSec.cedulaP) || relSec.cedulaP
          }

          const tuplasMatSec = tuplas.filter(t => t.codAsig === mat.codMateria && t.nroSeccion === sec)
          const scheduleKey = profNombre + '|' + tuplasMatSec.map(t => `${t.dia}_${t.hora}_${t.laboratorio?.name || ''}`).sort().join(';')

          const existingGroup = sectionGroups.find(g => g.scheduleKey === scheduleKey)
          if (existingGroup) {
            existingGroup.secciones.push(sec)
          } else {
            sectionGroups.push({
              secciones: [sec],
              profNombre,
              tuplasMatSec,
              scheduleKey
            })
          }
        }

        for (const group of sectionGroups) {
          const secLabel = nroSecciones > 1
            ? (group.secciones.length > 1 ? ` (Sección ${group.secciones.join(', ')})` : ` (Sección ${group.secciones[0]})`)
            : ''

          const profFormatted = formatProfessorsWithSections(group.secciones, mat.codMateria, relaciones, profMap) || group.profNombre

          const row: string[] = [
            semTag,
            profFormatted,
            `${mat.nombre}${secLabel}`
          ]

          for (const dia of dias) {
            const tuplasDia = group.tuplasMatSec.filter(t => t.dia === dia)
            row.push(formatTuplasDayText(tuplasDia))
          }

          dataRows.push(row)
          rowSemestres.push(sem)
          currentRowIndex++
        }
      }

      const semEndRow = currentRowIndex - 1
      if (semEndRow >= semStartRow) {
        merges.push({
          s: { r: semStartRow, c: 0 },
          e: { r: semEndRow, c: 0 }
        })
      }
    }

    const worksheet = XLSX.utils.aoa_to_sheet(dataRows)

    // Fusionar celdas del título y de la columna SEM por semestre
    worksheet['!merges'] = merges

    // Definir anchos de columna
    worksheet['!cols'] = [
      { wch: 8 },  // SEM
      { wch: 32 }, // PROFESOR
      { wch: 36 }, // ASIGNATURA
      { wch: 22 }, // LUNES
      { wch: 22 }, // MARTES
      { wch: 22 }, // MIÉRCOLES
      { wch: 22 }, // JUEVES
      { wch: 22 }, // VIERNES
      { wch: 22 }, // SÁBADO
      { wch: 22 }  // DOMINGO
    ]

    // Aplicar Estilos CSS a cada celda de la hoja Excel
    // 1. Estilo Título Principal (Fila 0)
    for (let c = 0; c <= 9; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: '0F172A' } },
          font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      }
    }

    // 2. Estilo Encabezados de Columna (Fila 1)
    for (let c = 0; c <= 9; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: '1E293B' } },
          font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '334155' } },
            bottom: { style: 'thin', color: { rgb: '334155' } },
            left: { style: 'thin', color: { rgb: '334155' } },
            right: { style: 'thin', color: { rgb: '334155' } }
          }
        }
      }
    }

    // 3. Estilo Filas de Datos (Fila r >= 2) con colores distintivos por semestre y bordes
    for (let r = 2; r < dataRows.length; r++) {
      const semNumber = rowSemestres[r - 2]
      const colors = semesterColors[semNumber] || { bg: 'F8FAFC', text: '334155', semBg: 'CBD5E1' }

      for (let c = 0; c <= 9; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 's', v: '' }
        }

        const isSemCol = c === 0
        const isAsigCol = c === 2

        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: isSemCol ? colors.semBg : colors.bg } },
          font: {
            name: 'Calibri',
            sz: isSemCol ? 11 : 9.5,
            bold: isSemCol || isAsigCol,
            color: { rgb: isSemCol ? colors.text : '1E293B' }
          },
          alignment: {
            horizontal: isSemCol ? 'center' : (c <= 2 ? 'left' : 'center'),
            vertical: 'center',
            wrapText: c >= 3
          },
          border: {
            top: { style: 'thin', color: { rgb: 'CBD5E1' } },
            bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
            left: { style: 'thin', color: { rgb: 'CBD5E1' } },
            right: { style: 'thin', color: { rgb: 'CBD5E1' } }
          }
        }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Horario')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Horario_${termName.replace(/\s+/g, '_')}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  exportarPdf (
    tuplas: Horario[],
    materias: Materia[],
    relaciones: Imparte[],
    profesores: Profesor[],
    config: ScheduleExportConfig
  ): void {
    const profMap = new Map<string, string>()
    profesores.forEach(p => profMap.set(p.cedula, p.nombre))

    const semestresTotales = Array.from(new Set(materias.map(m => m.semestre))).sort((a, b) => a - b)
    const semestresAExportar = config.scope === 'current_semester'
      ? [config.selectedSemester]
      : (semestresTotales.length > 0 ? semestresTotales : [config.selectedSemester])

    const horas = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00', '22:00'
    ]
    const dias: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

    let pagesHtml = ''

    semestresAExportar.forEach((sem, idx) => {
      const tuplasSem = tuplas.filter(t => t.semestre === sem)
      const skipMatrix: boolean[][] = Array.from({ length: horas.length }, () => Array(dias.length).fill(false))

      pagesHtml += `
      <div class="page ${idx < semestresAExportar.length - 1 ? 'page-break' : ''}">
        <div class="header">
          <h2>HORARIO SEMANAL - SEMESTRE ${sem}</h2>
          <p>Término Académico: ${escapeHtml(config.termName ?? 'Actual')}</p>
        </div>
        <table class="grid-table">
          <thead>
            <tr>
              <th class="time-header">Hora</th>
              ${dias.map(d => `<th>${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
      `

      horas.forEach((h, hIdx) => {
        pagesHtml += `<tr><td class="time-cell">${h}</td>`

        dias.forEach((d, dIdx) => {
          if (skipMatrix[hIdx][dIdx]) {
            return
          }

          const matchTuplas = tuplasSem.filter(t => t.dia === d && t.hora === h)
          if (matchTuplas.length === 0) {
            pagesHtml += `<td class="empty-cell"></td>`
          } else {
            const codsAsigUnicos = Array.from(new Set(matchTuplas.map(t => t.codAsig)))
            let maxSpan = 1

            const itemsHtml = codsAsigUnicos.map(codAsig => {
              const tuplasMat = matchTuplas.filter(t => t.codAsig === codAsig)
              const mat = materias.find(m => m.codMateria === codAsig)
              const secciones = Array.from(new Set(tuplasMat.map(t => t.nroSeccion))).sort((a, b) => a - b)
              const secLabel = secciones.length > 1 ? `Sección ${secciones.join(', ')}` : `Sec. ${secciones[0]}`

              // Obtener nombres de profesores formateados con las secciones que enseñan
              const profNameStr = formatProfessorsWithSections(secciones, codAsig, relaciones, profMap)

              // Obtener nombres de laboratorios involucrados
              const labsList = Array.from(new Set(tuplasMat.map(t => t.laboratorio?.name).filter(Boolean)))
              const labStr = labsList.length > 0 ? ` [${labsList.join(', ')}]` : ''

              const isManual = tuplasMat.some(t => t.isManual)

              // Calcular horas contiguas máximas para esta materia
              let span = 1
              for (let k = hIdx + 1; k < horas.length; k++) {
                const nextHour = horas[k]
                const hasContiguous = tuplasSem.some(
                  tNext => tNext.codAsig === codAsig &&
                    tNext.dia === d &&
                    tNext.hora === nextHour &&
                    secciones.includes(tNext.nroSeccion)
                )
                if (hasContiguous) {
                  span++
                } else {
                  break
                }
              }

              if (span > maxSpan) maxSpan = span

              const startHour = h
              const endHour = addFiftyMinutes(horas[hIdx + span - 1])
              const timeRangeStr = `${startHour} - ${endHour}`

              return `
                <div class="cell-block ${isManual ? 'manual' : ''}">
                  <div class="subject-title">${escapeHtml(mat?.nombre || codAsig)}</div>
                  <div class="subject-sub">${escapeHtml(secLabel)}${escapeHtml(labStr)}</div>
                  <div class="subject-time">⏱ ${timeRangeStr}</div>
                  ${profNameStr ? `<div class="prof-name">👤 ${escapeHtml(profNameStr)}</div>` : ''}
                </div>
              `
            }).join('')

            for (let k = 1; k < maxSpan; k++) {
              if (hIdx + k < horas.length) {
                skipMatrix[hIdx + k][dIdx] = true
              }
            }

            const rowspanAttr = maxSpan > 1 ? ` rowspan="${maxSpan}"` : ''
            pagesHtml += `<td${rowspanAttr} class="filled-cell">${itemsHtml}</td>`
          }
        })

        pagesHtml += `</tr>`
      })

      pagesHtml += `
          </tbody>
        </table>
      </div>
      `
    })

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes para exportar en PDF.')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horario PDF - ${config.termName ?? ''}</title>
        <style>
          @page { size: landscape; margin: 8mm; }
          @media print {
            @page { size: landscape; margin: 8mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-after: always; break-after: page; }
          }
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; color: #1E293B; background: #fff; }
          .page { width: 100%; box-sizing: border-box; }
          .page-break { page-break-after: always; break-after: page; }
          .header { text-align: center; margin-bottom: 10px; }
          .header h2 { margin: 0 0 3px 0; font-size: 16px; color: #0F172A; text-transform: uppercase; }
          .header p { margin: 0; font-size: 11px; color: #64748B; }
          .grid-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10px; }
          .grid-table th { background: #0F172A; color: #fff; border: 1px solid #334155; padding: 5px 2px; text-align: center; font-weight: 600; }
          .time-header { width: 60px; }
          .grid-table td { border: 1px solid #CBD5E1; padding: 4px; vertical-align: middle; box-sizing: border-box; }
          .grid-table td.filled-cell { padding: 2px; height: 1px; vertical-align: stretch; }
          .time-cell { background: #F8FAFC; text-align: center; font-weight: bold; vertical-align: middle; color: #475569; font-size: 10px; }
          .empty-cell { background: #FFFFFF; }
          .filled-cell { background: #FFFFFF; }
          .cell-block {
            background: #E0F2FE;
            border: 1px solid #38BDF8;
            border-left: 4px solid #0284C7;
            padding: 6px;
            border-radius: 6px;
            font-size: 9px;
            line-height: 1.3;
            box-sizing: border-box;
            height: 100%;
            min-height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .cell-block.manual {
            background: #FEF3C7;
            border: 1px solid #FCD34D;
            border-left: 4px solid #D97706;
          }
          .subject-title { font-weight: bold; color: #0369A1; font-size: 9.5px; margin-bottom: 2px; }
          .cell-block.manual .subject-title { color: #B45309; }
          .subject-sub { color: #334155; font-size: 8.5px; font-weight: 500; }
          .subject-time { color: #0284C7; font-size: 8.5px; font-weight: 600; margin-top: 2px; }
          .cell-block.manual .subject-time { color: #D97706; }
          .prof-name { color: #475569; font-size: 8px; font-style: italic; margin-top: 2px; }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }
}

function formatProfessorsWithSections (
  secciones: number[],
  codAsig: string,
  relaciones: Imparte[],
  profMap: Map<string, string>
): string {
  const mapProfToSecs = new Map<string, number[]>()

  secciones.forEach(sec => {
    const rel = relaciones.find(r => r.codAsig === codAsig && r.nroSeccion === sec)
    const name = rel?.cedulaP ? (profMap.get(rel.cedulaP) || rel.cedulaP) : 'Por Asignar'
    if (!mapProfToSecs.has(name)) {
      mapProfToSecs.set(name, [])
    }
    mapProfToSecs.get(name)!.push(sec)
  })

  const parts: string[] = []
  mapProfToSecs.forEach((secs, profName) => {
    if (profName === 'Por Asignar') return
    const secStr = secs.join(', ')
    parts.push(`${profName} (${secStr})`)
  })

  return parts.join(', ')
}

function formatTuplasDayText (tuplasDia: Horario[]): string {
  if (tuplasDia.length === 0) return ''

  const sorted = [...tuplasDia].sort((a, b) => a.hora.localeCompare(b.hora))

  const blocks: Array<{ start: string, end: string, lab: string }> = []
  let currentStart = ''
  let currentEnd = ''
  let currentLab = ''

  for (const t of sorted) {
    const labCode = t.laboratorio?.name || 'P/A'

    if (!currentStart) {
      currentStart = t.hora
      currentEnd = addFiftyMinutes(t.hora)
      currentLab = labCode
    } else {
      const endHour = parseInt(currentEnd.split(':')[0], 10)
      const nextStartHourStr = (endHour + 1).toString().padStart(2, '0') + ':00'

      if (t.hora === nextStartHourStr && labCode === currentLab) {
        currentEnd = addFiftyMinutes(t.hora)
      } else {
        blocks.push({ start: currentStart, end: currentEnd, lab: currentLab })
        currentStart = t.hora
        currentEnd = addFiftyMinutes(t.hora)
        currentLab = labCode
      }
    }
  }
  if (currentStart) {
    blocks.push({ start: currentStart, end: currentEnd, lab: currentLab })
  }

  return blocks.map(b => `${b.start} - ${b.end} ${b.lab}`).join(', ')
}

function addFiftyMinutes (startHourStr: string): string {
  const [hStr] = startHourStr.split(':')
  const h = parseInt(hStr, 10)
  const hStrPadded = h.toString().padStart(2, '0')
  return `${hStrPadded}:50`
}

function escapeHtml (text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
