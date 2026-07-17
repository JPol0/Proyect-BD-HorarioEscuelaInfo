import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type Materia } from '../../../domain/Materia.js'

// El mock con datos iniciales consistentes con la UI de Gestión de Materias
const MOCK_MATERIAS_SEED: Materia[] = [
  {
    codMateria: 'ING-201',
    nombre: 'Matematicas Discreta',
    nroSecciones: 1,
    horasPrac: 0,
    horasTeo: 4,
    horasLab: 0,
    semestre: 2,
    modalidad: 'PRE',
    esComun: true
  },
  {
    codMateria: 'INF-202',
    nombre: 'Algoritmos y Programacion',
    nroSecciones: 2,
    horasPrac: 0,
    horasTeo: 4,
    horasLab: 2,
    semestre: 2,
    modalidad: 'PRE',
    esComun: false
  },
  {
    codMateria: 'INF-301',
    nombre: 'Algoritmos y Estructuras de datos',
    nroSecciones: 1,
    horasPrac: 0,
    horasTeo: 4,
    horasLab: 2,
    semestre: 3,
    modalidad: 'PRE',
    esComun: false
  }
]

export class MockMateriaRepository implements MateriaRepository {
  private readonly almacen = new Map<string, Materia[]>()

  constructor () {
    // Inicializar los términos de prueba por defecto
    this.almacen.set('1', [...MOCK_MATERIAS_SEED])
    this.almacen.set('2', [...MOCK_MATERIAS_SEED])
  }

  /**
   * Retorna todo el universo de materias en memoria para el term dado.
   */
  async getAll (term: string): Promise<Materia[]> {
    return this.almacen.get(term) ?? []
  }

  /**
   * Guarda una materia. Si ya existe el código lo actualiza (Upsert),
   * en caso contrario, registra la nueva entidad en el array del term.
   */
  async save (term: string, materia: Materia): Promise<void> {
    if (materia.codMateria === undefined || materia.codMateria.trim() === '') {
      throw new Error('El código de materia es requerido para guardar en el repositorio')
    }

    const materias = this.almacen.get(term) ?? []
    const index = materias.findIndex(
      (m) => m.codMateria === materia.codMateria
    )

    if (index !== -1) {
      // Si existe, reemplazamos por completo con la nueva información del formulario/PDF
      materias[index] = materia
    } else {
      // Si no existe, es una materia nueva
      materias.push(materia)
    }

    this.almacen.set(term, materias)
  }

  /**
   * Elimina una materia de la lista en memoria por su código.
   */
  async delete (term: string, codMateria: string): Promise<void> {
    const materias = this.almacen.get(term) ?? []
    const index = materias.findIndex(
      (m) => m.codMateria === codMateria
    )
    if (index !== -1) {
      materias.splice(index, 1)
      this.almacen.set(term, materias)
    } else {
      throw new Error(`No se encontró la materia con código ${codMateria}`)
    }
  }

  /**
   * Elimina todas las materias asociadas a un término (borrado en cascada).
   */
  async clearTerm (term: string): Promise<void> {
    this.almacen.delete(term)
  }

  /**
   * Guarda un lote de materias para un término seleccionado.
   */
  async saveBatch (
    term: string,
    materias: Materia[],
    _prereqs: Array<{ codMateria: string, prereqNombres: string[] }>
  ): Promise<void> {
    this.almacen.set(term, [...materias])
  }
}
