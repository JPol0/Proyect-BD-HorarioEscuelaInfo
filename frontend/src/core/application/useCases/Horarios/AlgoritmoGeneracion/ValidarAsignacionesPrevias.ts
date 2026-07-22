import { type Materia } from '../../../../domain/Materia'
import { type Horario, type DaysOfWeek } from '../../../../domain/Horario'

export const DIAS_SEMANA_BASE: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
export const HORAS_DISPONIBLES_BASE = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
]

export const convertirARomano = (num: number): string => {
  const valoresRomanos: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let resultado = ''
  let valorRestante = num
  for (const key in valoresRomanos) {
    while (valorRestante >= valoresRomanos[key]) {
      resultado += key
      valorRestante -= valoresRomanos[key]
    }
  }
  return resultado
}

export function validarAsignacionesPrevias (
  materiasDelSemestre: Materia[],
  tuplasEnProceso: Horario[],
  profesorAssignments: Record<string, Record<number, string>>,
  profesorLabAssignments: Record<string, Record<number, string>> | undefined,
  laboratorioAssignments: Record<string, { principal: number, secundarios: number[] }>
): void {
  const missingProfessors: string[] = []
  const missingLabs: string[] = []
  const missingCommonSchedules: string[] = []

  for (const materia of materiasDelSemestre) {
    const nroSecciones = Math.max(1, materia.nroSecciones)
    for (let sec = 1; sec <= nroSecciones; sec++) {
      if (materia.horasTeo > 0 || materia.horasPrac > 0) {
        const cedulaProf = profesorAssignments[materia.codMateria]?.[sec]
        if (!cedulaProf) {
          missingProfessors.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)}) (Teoría/Práctica)`)
        }
      }

      if (materia.horasLab > 0) {
        const labObj = laboratorioAssignments[materia.codMateria]
        if (!labObj?.principal) {
          missingLabs.push(`- ${materia.nombre} (Falta Laboratorio Principal)`)
        }
        const cedulaProfLab = profesorLabAssignments?.[materia.codMateria]?.[sec]
        if (!cedulaProfLab) {
          missingProfessors.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)}) (Laboratorio)`)
        }
      }

      if (materia.esComun) {
        const isAssigned = tuplasEnProceso.some(t => t.codAsig === materia.codMateria && t.nroSeccion === sec)
        if (!isAssigned) {
          missingCommonSchedules.push(`- ${materia.nombre} (Sección ${convertirARomano(sec)})`)
        }
      }
    }
  }

  if (missingProfessors.length > 0) {
    throw new Error(`Aún no se le han asignado profesores a las siguientes materias:\n\n${missingProfessors.join('\n')}`)
  }

  if (missingLabs.length > 0) {
    throw new Error(`Aún no se le han asignado laboratorios a las siguientes materias (requerido por tener horas de lab):\n\n${missingLabs.join('\n')}`)
  }

  if (missingCommonSchedules.length > 0) {
    throw new Error(`En las materias comunes aún no se han asignado los horarios para las siguientes secciones:\n\n${missingCommonSchedules.join('\n')}`)
  }
}
