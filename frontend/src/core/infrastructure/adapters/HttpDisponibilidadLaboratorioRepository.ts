import type { DisponibilidadLaboratorioRepository } from '../../application/ports/DisponibilidadLaboratorioRepository'
import type { DisponibilidadLaboratorio } from '../../domain/DisponibilidadLaboratorio'
import type { Laboratorio } from '../../domain/Laboratorio'
import { API_CONFIG } from '../config/api'

interface DisponibilidadLaboratorioResponse {
  laboratorio: Laboratorio
  disponibilidad: DisponibilidadLaboratorio[]
}

export class HttpDisponibilidadLaboratorioRepository implements DisponibilidadLaboratorioRepository {
  async obtenerPorLaboratorioYTerm (idLaboratorio: number, codTerm: string): Promise<DisponibilidadLaboratorio[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/laboratorios/${idLaboratorio}/disponibilidad?term=${codTerm}`)
    if (!response.ok) {
      throw new Error('Error al obtener la disponibilidad del laboratorio')
    }
    const data = await response.json() as DisponibilidadLaboratorioResponse
    return data.disponibilidad.map(d => ({
      idLaboratorio: Number(d.idLaboratorio),
      dia: d.dia,
      hora: d.hora,
      ocupado: Boolean(d.ocupado)
    }))
  }

  async guardar (idLaboratorio: number, codTerm: string, disponibilidad: DisponibilidadLaboratorio[]): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/laboratorios/${idLaboratorio}/disponibilidad?term=${codTerm}`, {
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
