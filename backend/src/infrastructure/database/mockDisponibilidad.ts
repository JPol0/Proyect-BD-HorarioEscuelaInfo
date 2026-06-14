import type { DisponibilidadHoraria } from '../../domain/DisponibilidadHoraria'

/**
 * Datos en memoria que reproducen el mockup de "Carga de Disponibilidad
 * Horaria" para el profesor Yoel Gutierrez (V-12345678) en el TERM 202615.
 * `materiaAsignada` representa bloques ya asignados (ocupado = true),
 * de solo lectura para el profesor.
 */
export const disponibilidadMock: DisponibilidadHoraria[] = [
  { cedulaProfesor: 'V-12345678', codTerm: '202615', dia: 'Martes', numeroModulo: 1, disponibilidad: 0, ocupado: true, materiaAsignada: 'Álgebra Lineal' },
  { cedulaProfesor: 'V-12345678', codTerm: '202615', dia: 'Martes', numeroModulo: 2, disponibilidad: 0, ocupado: true, materiaAsignada: 'Álgebra Lineal' },
  { cedulaProfesor: 'V-12345678', codTerm: '202615', dia: 'Lunes', numeroModulo: 3, disponibilidad: 0, ocupado: true, materiaAsignada: 'Matemática Discreta' },
  { cedulaProfesor: 'V-12345678', codTerm: '202615', dia: 'Jueves', numeroModulo: 5, disponibilidad: 0, ocupado: true, materiaAsignada: 'Cálculo Vectorial' },
  { cedulaProfesor: 'V-12345678', codTerm: '202615', dia: 'Martes', numeroModulo: 8, disponibilidad: 0, ocupado: true, materiaAsignada: 'Cálculo Vectorial' }
]
