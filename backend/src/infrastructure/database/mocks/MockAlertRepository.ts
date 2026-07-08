import { type AlertRepository } from '../../../application/ports/AlertRepository.js'
import { type Alert } from '../../../domain/Alert.js'

const MOCK_ALERTAS: Alert[] = [
  {
    id: '1_1',
    titulo: 'El Dr. Arispe está asignado a "Diseño Estructural II" y "Materiales Avanzados" simultáneamente los Lunes a las 10:00 AM.',
    estado: 'PENDIENTE',
    fecha: '2026-07-07T10:00:00.000Z'
  },
  {
    id: '1_2',
    titulo: 'El "Laboratorio de Modelado 3D" tiene 45 alumnos asignados, pero la capacidad máxima es 30. Miércoles 14:00 PM.',
    estado: 'PENDIENTE',
    fecha: '2026-07-07T10:30:00.000Z'
  },
  {
    id: '1_3',
    titulo: 'Estudiantes inscritos en "Taller V" sin haber completado "Historia de la Arquitectura II". Afecta a 3 estudiantes.',
    estado: 'PENDIENTE',
    fecha: '2026-07-07T11:00:00.000Z'
  }
]

export class MockAlertRepository implements AlertRepository {
  async getAllAlerts (term: string): Promise<Alert[]> {
    return MOCK_ALERTAS.filter((a) => a.id.startsWith(term + '_'))
  }

  async save (term: string, alert: Alert): Promise<void> {
    const index = MOCK_ALERTAS.findIndex((a) => a.id === alert.id)
    if (index === -1) {
      MOCK_ALERTAS.push(alert)
      return
    }
    MOCK_ALERTAS[index] = alert
  }
}
