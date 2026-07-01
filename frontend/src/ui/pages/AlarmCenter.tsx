import { useEffect, useState } from 'react'
import { HttpAlertRepository } from '../../core/infrastructure/adapters/HttpAlertRepository'
import { ObtenerAlertasPendientes } from '../../core/application/useCases/Alarm/GetAlarmsPending'
import { GuardarEstadoAlerta } from '../../core/application/useCases/Alarm/saveAlarmsState'
import { type Alerta, type EstadoAlerta } from '../../core/domain/Alarm'
import { AlertCard } from '../components/AlertScreen/AlertCard'
import Title from '../components/TitlePage'

// Instanciación manual de dependencias
const alertaRepository = new HttpAlertRepository()
const obtenerUseCase = new ObtenerAlertasPendientes(alertaRepository)
const guardarUseCase = new GuardarEstadoAlerta(alertaRepository)

export default function AlarmCenter () {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarAlertas = async () => {
    try {
      const lista = await obtenerUseCase.execute()
      setAlertas(lista)
    } catch (error) {
      console.error('Error al recuperar las alertas:', error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarAlertas()
  }, [])

  const manejarGuardarEstado = async (id: string, nuevoEstado: EstadoAlerta, motivo?: string) => {
    await guardarUseCase.execute(id, nuevoEstado, motivo)
    // Al procesar la alerta, recargamos. Si cambió de estado, desaparecerá automáticamente.
    await cargarAlertas()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Title
        title="Centro de Alarmas"
        subtitle="Conflictos detectados durante la generación del horario."
      />

      <h2 className="text-lg font-bold text-slate-700 tracking-wide font-hanken uppercase mb-5">
        Listado de Conflictos
      </h2>

      {cargando
        ? (
        <p className="text-slate-500 italic animate-pulse font-hanken">Cargando conflictos...</p>
          )
        : alertas.length === 0
          ? (
        <div className="p-8 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-center font-medium font-hanken shadow-sm">
          🎉 ¡Excelente! No se registran alertas ni conflictos pendientes en este ciclo.
        </div>
            )
          : (
        <div className="flex flex-col">
          {alertas.map((alerta) => (
            <AlertCard
              key={alerta.id}
              alerta={alerta}
              onGuardar={manejarGuardarEstado}
            />
          ))}
        </div>
            )}
    </div>
  )
}
