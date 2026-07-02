import { type Materia } from '../Materia'
import { type Horario, type DaysOfWeek } from '../Horario'

export const autoAsignarMateria = (
  materia: Materia,
  horarioActual: Horario[],
  termId: string,
  seccion: number = 1
): Horario[] => {
  const totalHoras = materia.horasTeo + materia.horasLab
  if (totalHoras === 0) return horarioActual

  // Si la materia tiene 6 horas en total, preferimos asignar 3 bloques de 2 horas
  // en lugar de usar bloques de 3 horas.
  const maxHorasPorDia = totalHoras === 6 ? 2 : 3

  // Limpiamos las horas que ya tuviese asignadas esta materia en esta sección,
  // así evitamos duplicarla y permitimos que se redistribuya de cero.
  const horarioSinEstaMateria = horarioActual.filter(
    (t) => !(t.codAsig === materia.codMateria && t.codTerm === termId && t.nroSeccion === seccion)
  )

  const diasSemanasBase: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  // Mezclamos los días para que cada vez que se presione "Asignar Horas" genere una opción diferente
  const diasSemanas = [...diasSemanasBase].sort(() => Math.random() - 0.5)

  const horasDisponiblesBase = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00'
  ]

  const horasFaltantes = totalHoras
  const nuevasTuplas: Horario[] = []

  const asignarBloques = (horasNecesarias: number, tipo: string) => {
    let faltantes = horasNecesarias
    for (const dia of diasSemanas) {
      if (faltantes <= 0) break

      // Solo permitimos asignar si la materia NO tiene NINGUNA hora ese día (en esta sección)
      // garantizando que Teoría y Laboratorio queden en días distintos y un solo bloque por día.
      const tieneHorasHoy = nuevasTuplas.some((t) => t.dia === dia)
      if (tieneHorasHoy) continue

      const maxPosiblesHoy = Math.min(faltantes, maxHorasPorDia)

      let bloqueActual: string[] = []
      const bloquesLibres: string[][] = []

      for (const hora of horasDisponiblesBase) {
        const estaOcupado = horarioSinEstaMateria.some((t) => t.dia === dia && t.hora === hora && t.semestre === materia.semestre)

        if (!estaOcupado) {
          bloqueActual.push(hora)
        } else {
          if (bloqueActual.length > 0) {
            bloquesLibres.push(bloqueActual)
            bloqueActual = []
          }
        }
      }
      if (bloqueActual.length > 0) {
        bloquesLibres.push(bloqueActual)
      }

      bloquesLibres.sort((a, b) => b.length - a.length)

      if (bloquesLibres.length > 0) {
        const mejorBloque = bloquesLibres[0]
        const horasAAsignar = mejorBloque.slice(0, Math.min(mejorBloque.length, maxPosiblesHoy))

        for (const hora of horasAAsignar) {
          nuevasTuplas.push({
            codAsig: materia.codMateria,
            codTerm: termId,
            nroSeccion: seccion,
            dia,
            hora,
            semestre: materia.semestre,
            codLaboratorio: materia.laboratorioId
          })
          faltantes--
        }
      }
    }

    if (faltantes > 0) {
      throw new Error(`No hay suficiente espacio en el horario para asignar todas las horas de ${tipo} de ${materia.nombre}. Faltaron ${faltantes} horas.`)
    }
  }

  // 1. Asignamos primero las horas de Laboratorio
  if (materia.horasLab > 0) {
    asignarBloques(materia.horasLab, 'Laboratorio')
  }

  // 2. Luego asignamos las horas Teóricas en los días que quedaron libres
  if (materia.horasTeo > 0) {
    asignarBloques(materia.horasTeo, 'Teoría')
  }

  return [...horarioSinEstaMateria, ...nuevasTuplas]
}
