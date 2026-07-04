import { type MateriaRepository } from '../../../application/ports/MateriaRepository.js'
import { type Materia } from '../../../domain/Materia.js'

// El mock con datos iniciales consistentes con la UI de Gestión de Materias
const MOCK_MATERIAS: Materia[] = [
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
  /**
   * Retorna todo el universo de materias en memoria.
   */
  async getAll (term: string): Promise<Materia[]> {
    return MOCK_MATERIAS
  }

  /**
   * Guarda una materia. Si ya existe el código lo actualiza (Upsert),
   * en caso contrario, registra la nueva entidad en el array.
   */
  async save (term: string, materia: Materia): Promise<void> {
    if (materia.codMateria === undefined || materia.codMateria.trim() === '') {
      throw new Error('El código de materia es requerido para guardar en el repositorio')
    }

    const index = MOCK_MATERIAS.findIndex(
      (m) => m.codMateria === materia.codMateria
    )

    if (index !== -1) {
      // Si existe, reemplazamos por completo con la nueva información del formulario/PDF
      MOCK_MATERIAS[index] = materia
    } else {
      // Si no existe, es una materia nueva
      MOCK_MATERIAS.push(materia)
    }
  }

  /**
   * Elimina una materia de la lista en memoria por su código.
   */
  async delete (term: string, codMateria: string): Promise<void> {
    const index = MOCK_MATERIAS.findIndex(
      (m) => m.codMateria === codMateria
    )
    if (index !== -1) {
      MOCK_MATERIAS.splice(index, 1)
    } else {
      throw new Error(`No se encontró la materia con código ${codMateria}`)
    }
  }
}
