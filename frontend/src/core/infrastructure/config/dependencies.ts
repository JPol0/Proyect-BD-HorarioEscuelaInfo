import { ApiClient } from '../http/ApiClient'
import { HttpDisponibilidadRepository } from '../http/HttpDisponibilidadRepository'
import { HttpProfesorRepository } from '../http/HttpProfesorRepository'
import { ObtenerDisponibilidadHoraria } from '../../application/use-cases/ObtenerDisponibilidadHoraria'
import { ActualizarCeldaDisponibilidad } from '../../application/use-cases/ActualizarCeldaDisponibilidad'
import { GuardarDisponibilidadHoraria } from '../../application/use-cases/GuardarDisponibilidadHoraria'
import { ObtenerProfesorActivo } from '../../application/use-cases/ObtenerProfesorActivo'

export const TERM_ACTIVO = '202615'

const apiClient = new ApiClient()
const disponibilidadRepository = new HttpDisponibilidadRepository(apiClient)
const profesorRepository = new HttpProfesorRepository(apiClient, TERM_ACTIVO)

export const container = {
  obtenerDisponibilidadHoraria: new ObtenerDisponibilidadHoraria(disponibilidadRepository),
  actualizarCeldaDisponibilidad: new ActualizarCeldaDisponibilidad(),
  guardarDisponibilidadHoraria: new GuardarDisponibilidadHoraria(disponibilidadRepository),
  obtenerProfesorActivo: new ObtenerProfesorActivo(profesorRepository)
}
