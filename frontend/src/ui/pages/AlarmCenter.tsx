import { useEffect, useState } from 'react'
import { HttpAlertRepository } from '../../core/infrastructure/adapters/HttpAlertRepository'
import { ObtenerTodasLasAlertas } from '../../core/application/useCases/Alarm/GetAllAlarms'
import { GuardarEstadoAlerta } from '../../core/application/useCases/Alarm/saveAlarmsState'
import { type Alerta, type EstadoAlerta } from '../../core/domain/Alarm'
import { AlertCard } from '../components/AlertScreen/AlertCard'
import Title from '../components/common/TitlePage'
import { Select, ListBox } from '@heroui/react'
import { Clock, Check, EyeSlash, CircleCheckFill } from '@gravity-ui/icons'
import { useActiveTerm } from '../store/activeTermStore'

const alertaRepository = new HttpAlertRepository()
const obtenerUseCase = new ObtenerTodasLasAlertas(alertaRepository)
const guardarUseCase = new GuardarEstadoAlerta(alertaRepository)

type TipoFiltro = EstadoAlerta | 'TODAS'

export default function AlarmCenter () {
  const { activeTerm } = useActiveTerm()
  const termId = activeTerm?.id ?? ''

  const [todasAlertas, setTodasAlertas] = useState<Alerta[]>([])
  const [filtro, setFiltro] = useState<TipoFiltro>('PENDIENTE')
  const [cargando, setCargando] = useState(true)

  const cargarAlertas = async () => {
    if (termId === '') {
      setTodasAlertas([])
      setCargando(false)
      return
    }
    try {
      const lista = await obtenerUseCase.execute(termId)
      setTodasAlertas(lista)
    } catch (error) {
      console.error('Error al recuperar las alertas:', error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarAlertas()
  }, [termId])

  const manejarGuardarEstado = async (id: number | null, nuevoEstado: EstadoAlerta, motivo?: string) => {
    const existingAlert = todasAlertas.find(a => a.id === id)
    if (!existingAlert) return

    await guardarUseCase.execute(termId, {
      ...existingAlert,
      estado: nuevoEstado,
      motivoCambio: motivo
    })
    await cargarAlertas()
  }

  const alertasFiltradas = todasAlertas.filter((alerta) => {
    if (filtro === 'TODAS') return true
    return alerta.estado === filtro
  })

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-9 space-y-6">
      <Title
        title="Centro de Alarmas"
        subtitle="Conflictos detectados durante la generación del horario."
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-100 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-700 tracking-wide font-hanken uppercase">
          Listado de Conflictos
        </h2>

        <div className="w-full sm:w-56 shrink-0 z-30">
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
            <Select.Trigger className="flex justify-between items-center w-full border border-slate-200/80 rounded-lg px-3 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 h-11 sm:h-9 font-medium shadow-sm">
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

            <Select.Popover className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-50 z-30">
              <ListBox>
                <ListBox.Item
                  id="PENDIENTE"
                  textValue="Pendientes"
                  className="px-3 py-2 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2 min-h-[44px]"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Pendientes
                </ListBox.Item>

                <ListBox.Item
                  id="RESUELTA"
                  textValue="Resueltas"
                  className="px-3 py-2 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2 min-h-[44px]"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Resueltas
                </ListBox.Item>

                <ListBox.Item
                  id="IGNORADA"
                  textValue="Ignoradas"
                  className="px-3 py-2 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2 min-h-[44px]"
                >
                  <EyeSlash className="w-3.5 h-3.5 text-slate-400" />
                  Ignoradas
                </ListBox.Item>

                <ListBox.Item
                  id="TODAS"
                  textValue="Todas las alertas"
                  className="px-3 py-2 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-semibold border-t border-slate-100 mt-1 min-h-[44px]"
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
            <div className="p-8 bg-emerald-50/60 border border-emerald-100 text-emerald-800 rounded-xl text-center font-medium font-hanken shadow-sm flex items-center justify-center gap-2">
              {filtro === 'PENDIENTE' && (
                <>
                  <CircleCheckFill className="w-5 h-5 text-emerald-600" />
                  <span>¡Excelente! No se registran alertas ni conflictos pendientes en este ciclo.</span>
                </>
              )}
              {filtro === 'RESUELTA' && 'No se registran alertas resueltas.'}
              {filtro === 'IGNORADA' && 'No se registran alertas ignoradas.'}
              {filtro === 'TODAS' && 'No se registran alertas en este ciclo.'}
            </div>
            )
          : (
            <div className="flex flex-col gap-4">
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
