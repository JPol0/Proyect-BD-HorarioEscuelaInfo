import { type Materia } from '../../../domain/Materia'

export class GetMateriaByCodigo {
  /**
   * Ejecuta el filtrado en memoria sobre el arreglo de materias previamente descargado.
   * Al ser una búsqueda local, no requiere retornar una Promesa.
   */
  execute (materias: Materia[], codMateria: string): Materia | undefined {
    return materias.find((materia) => materia.codMateria === codMateria)
  }
}
