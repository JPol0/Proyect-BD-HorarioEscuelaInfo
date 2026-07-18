import type { DisponibilidadLaboratorioRepository } from '../../application/ports/DisponibilidadLaboratorioRepository'
import type { DisponibilidadLaboratorio } from '../../domain/DisponibilidadLaboratorio'
import type { Laboratorio } from '../../domain/Laboratorio'

interface DisponibilidadLaboratorioResponse {
  laboratorio: Laboratorio
  disponibilidad: DisponibilidadLaboratorio[]
}

const BASE_URL = 'http://localhost:3000/api'

export class HttpDisponibilidadLaboratorioRepository implements DisponibilidadLaboratorioRepository {
  async obtenerPorLaboratorioYTerm (idLaboratorio: number, codTerm: string): Promise<DisponibilidadLaboratorio[]> {
    const response = await fetch(`${BASE_URL}/laboratorios/${idLaboratorio}/disponibilidad?term=${codTerm}`)
    if (!response.ok) {
      throw new Error('Error al obtener la disponibilidad del laboratorio')
    }
    const data = await response.json() as DisponibilidadLaboratorioResponse
    return data.disponibilidad
  }

  async guardar (idLaboratorio: number, codTerm: string, disponibilidad: DisponibilidadLaboratorio[]): Promise<void> {
    const response = await fetch(`${BASE_URL}/laboratorios/${idLaboratorio}/disponibilidad?term=${codTerm}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(disponibilidad)
    })
    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al guardar la disponibilidad del laboratorio')
    }
  }
}
