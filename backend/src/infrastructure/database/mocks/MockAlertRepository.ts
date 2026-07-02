import { type AlertRepository } from '../../../application/ports/AlertRepository.js'
import { type Alert, type AlertState } from '../../../domain/Alert.js'

// El mock ahora vive en el servidor
const MOCK_ALERTAS: Alert[] = [
  {
    id: '1',
    titulo: 'Solapamiento de Profesor',
    descripcion: 'El Dr. Arispe está asignado a "Diseño Estructural II" y "Materiales Avanzados" simultáneamente los Lunes a las 10:00 AM.',
    estado: 'PENDIENTE'
  },
  {
    id: '2',
    titulo: 'Capacidad de Laboratorio Excedida',
    descripcion: 'El "Laboratorio de Modelado 3D" tiene 45 alumnos asignados, pero la capacidad máxima es 30. Miércoles 14:00 PM.',
    estado: 'PENDIENTE'
  },
  {
    id: '3',
    titulo: 'Conflicto de Pre-requisitos',
    descripcion: 'Estudiantes inscritos en "Taller V" sin haber completado "Historia de la Arquitectura II". Afecta a 3 estudiantes.',
    estado: 'PENDIENTE'
  }
]

export class MockAlertRepository implements AlertRepository {
  async getAllAlerts (): Promise<Alert[]> {
    return MOCK_ALERTAS
  }

  async saveState (id: string, estado: AlertState, motivo?: string): Promise<void> {
    const index = MOCK_ALERTAS.findIndex((alert) => alert.id === id)
    if (index === -1) {
      throw new Error('La alerta solicitada no existe')
    }
    MOCK_ALERTAS[index].estado = estado
    MOCK_ALERTAS[index].motivoCambio = motivo
  }
}
