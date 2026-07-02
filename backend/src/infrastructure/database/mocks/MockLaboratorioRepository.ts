import { type LaboratorioRepository } from '../../../application/ports/LaboratorioRepository.js'
import { type Laboratorio } from '../../../domain/Laboratorio.js'

// Datos de mock en memoria — reemplazar por adaptador de BD cuando se implemente
const MOCK_LABORATORIOS: Laboratorio[] = [
  { id: '1', name: 'Lab de Computación A' },
  { id: '2', name: 'Laboratorio de Modelado 3D' },
  { id: '3', name: 'Sala de Redes y Telecom' }
]

export class MockLaboratorioRepository implements LaboratorioRepository {
  async getAll (): Promise<Laboratorio[]> {
    return [...MOCK_LABORATORIOS]
  }

  async save (laboratorio: Laboratorio): Promise<void> {
    const index = MOCK_LABORATORIOS.findIndex((l) => l.id === laboratorio.id)
    if (index !== -1) {
      MOCK_LABORATORIOS[index] = laboratorio
    } else {
      MOCK_LABORATORIOS.push(laboratorio)
    }
  }

  async delete (id: string): Promise<void> {
    const index = MOCK_LABORATORIOS.findIndex((l) => l.id === id)
    if (index === -1) {
      throw new Error('El laboratorio solicitado no existe')
    }
    MOCK_LABORATORIOS.splice(index, 1)
  }
}
