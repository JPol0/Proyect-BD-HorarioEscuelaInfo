export type MateriaModalidad = 'PRE' | 'VIT'

export interface Materia {
  codMateria: string // CodMateria en BD
  nombre: string // Nombre
  nroSecciones: number // NroSecciones
  horasTeo: number // HorasTeoricas
  horasLab: number // HorasLab
  semestre: number // semestre (asumiendo numérico: 1, 2, 3...)
  modalidad: MateriaModalidad // modalidad (PRE o VIT)
  esComun: boolean // esComun (Mapeado a boolean para mejor lógica en JS/TS)
  preReq: string[] // Pre-Req (Lista con los nombres de las materias)
  laboratorioId?: string // Id del laboratorio asignado
}
