import { type Materia } from '../Materia'

export const getByCodigo = (materias: Materia[], codMateria: string): Materia | undefined => {
  return materias.find((materia) => materia.codMateria === codMateria)
}

export const calcularSemestreMaximo = (materias: Materia[]): number => {
  if (!materias || materias.length === 0) return 0
  return Math.max(...materias.map(m => m.semestre))
}

export const puedeAsignarHoras = (materia: Materia): boolean => {
  return (materia.horasTeo > 0 || materia.horasLab > 0)
}
