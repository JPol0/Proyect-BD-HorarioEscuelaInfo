export type MateriaModalidad = 'PRE' | 'VIT'

export interface Materia {
  codMateria: string
  nombre: string
  nroSecciones: number
  horasTeoricas: number
  horasLab: number
  semestre: number
  modalidad: MateriaModalidad
  esComun: boolean
  preReq: string[]
}
