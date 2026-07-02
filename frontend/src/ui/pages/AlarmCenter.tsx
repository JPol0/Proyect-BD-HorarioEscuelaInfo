import { useEffect, useState } from 'react'
import { HttpAlertRepository } from '../../core/infrastructure/adapters/HttpAlertRepository'
import { ObtenerTodasLasAlertas } from '../../core/application/useCases/Alarm/GetAllAlarms'
import { GuardarEstadoAlerta } from '../../core/application/useCases/Alarm/saveAlarmsState'
import { type Alerta, type EstadoAlerta } from '../../core/domain/Alarm'
import { AlertCard } from '../components/AlertScreen/AlertCard'
import Title from '../components/TitlePage'
import { Select, ListBox } from '@heroui/react'
import { Clock, Check, EyeSlash } from '@gravity-ui/icons'

// Instanciación manual de dependencias
const alertaRepository = new HttpAlertRepository()
const obtenerUseCase = new ObtenerTodasLasAlertas(alertaRepository)
const guardarUseCase = new GuardarEstadoAlerta(alertaRepository)

type TipoFiltro = EstadoAlerta | 'TODAS'

export default function AlarmCenter () {
  const [todasAlertas, setTodasAlertas] = useState<Alerta[]>([])
  const [filtro, setFiltro] = useState<TipoFiltro>('PENDIENTE')
  const [cargando, setCargando] = useState(true)

  const cargarAlertas = async () => {
    try {
      const lista = await obtenerUseCase.execute()
      setTodasAlertas(lista)
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
    // Al procesar la alerta, recargamos.
    await cargarAlertas()
  }

  const alertasFiltradas = todasAlertas.filter((alerta) => {
    if (filtro === 'TODAS') return true
    return alerta.estado === filtro
  })

  return (
    <div className="max-w-5xl mx-auto">
      <Title
        title="Centro de Alarmas"
        subtitle="Conflictos detectados durante la generación del horario."
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-700 tracking-wide font-hanken uppercase">
          Listado de Conflictos
        </h2>

        <div className="w-56 shrink-0 z-40">
          <Select
            aria-label="Filtrar por estado"
            placeholder="Filtrar por estado"
            value={filtro}
            onChange={(valor) => {
              if (valor === 'PENDIENTE' || valor === 'RESUELTA' || valor === 'IGNORADA' || valor === 'TODAS') {
                setFiltro(valor)
              }
            }}
            className="w-full text-xs"
          >
            {/* Gatillo/Botón */}
            <Select.Trigger className="flex justify-between items-center w-full border border-slate-200/80 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 h-8 font-medium shadow-sm">
              <Select.Value>
                <div className="flex items-center gap-1.5">
                  {filtro === 'PENDIENTE' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                  {filtro === 'RESUELTA' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  {filtro === 'IGNORADA' && <EyeSlash className="w-3.5 h-3.5 text-slate-400" />}
                  <span>
                    {filtro === 'PENDIENTE' && 'Pendientes'}
                    {filtro === 'RESUELTA' && 'Resueltas'}
                    {filtro === 'IGNORADA' && 'Ignoradas'}
                    {filtro === 'TODAS' && 'Todas las alertas'}
                  </span>
                </div>
              </Select.Value>
              <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
            </Select.Trigger>

            {/* Popover y ListBox */}
            <Select.Popover className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-[200px] z-50">
              <ListBox>
                <ListBox.Item
                  id="PENDIENTE"
                  textValue="Pendientes"
                  className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Pendientes
                </ListBox.Item>

                <ListBox.Item
                  id="RESUELTA"
                  textValue="Resueltas"
                  className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Resueltas
                </ListBox.Item>

                <ListBox.Item
                  id="IGNORADA"
                  textValue="Ignoradas"
                  className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                >
                  <EyeSlash className="w-3.5 h-3.5 text-slate-400" />
                  Ignoradas
                </ListBox.Item>

                <ListBox.Item
                  id="TODAS"
                  textValue="Todas las alertas"
                  className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-semibold border-t border-slate-100 mt-1"
                >
                  Todas las alertas
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {cargando
        ? (
        <p className="text-slate-500 italic animate-pulse font-hanken">Cargando conflictos...</p>
          )
        : alertasFiltradas.length === 0
          ? (
        <div className="p-8 bg-emerald-50/60 border border-emerald-100 text-emerald-800 rounded-xl text-center font-medium font-hanken shadow-sm">
          {filtro === 'PENDIENTE' && '🎉 ¡Excelente! No se registran alertas ni conflictos pendientes en este ciclo.'}
          {filtro === 'RESUELTA' && 'No se registran alertas resueltas.'}
          {filtro === 'IGNORADA' && 'No se registran alertas ignoradas.'}
          {filtro === 'TODAS' && 'No se registran alertas en este ciclo.'}
        </div>
            )
          : (
        <div className="flex flex-col">
          {alertasFiltradas.map((alerta) => (
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
