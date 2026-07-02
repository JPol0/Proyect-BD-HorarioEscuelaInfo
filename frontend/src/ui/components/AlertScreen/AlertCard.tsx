import { useState } from 'react'
import { Card, Button, Select, TextArea, ListBox } from '@heroui/react'
import { FloppyDisk, Clock, Check, EyeSlash } from '@gravity-ui/icons'
import { type Alerta, type EstadoAlerta } from '../../../core/domain/Alarm'

interface AlertCardProps {
  alerta: Alerta
  onGuardar: (id: string, nuevoEstado: EstadoAlerta, motivo?: string) => Promise<void>
}

export function AlertCard ({ alerta, onGuardar }: AlertCardProps) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoAlerta>(alerta.estado)
  const [motivo, setMotivo] = useState(alerta.motivoCambio ?? '')
  const [cargando, setCargando] = useState(false)

  const manejarGuardar = async () => {
    try {
      setCargando(true)
      await onGuardar(alerta.id, estadoSeleccionado, motivo)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ocurrió un error inesperado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Card className="mb-4 shadow-sm border border-slate-100 rounded-xl bg-white overflow-hidden">
      <Card.Content className="px-4 py-3 flex flex-col md:flex-row gap-5 justify-between items-stretch">

        {/* Lado Izquierdo: Información del Conflicto */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide uppercase ${alerta.estado === 'PENDIENTE'
                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                : alerta.estado === 'RESUELTA'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
              {alerta.estado === 'PENDIENTE' && <Clock className="w-3 h-3" />}
              {alerta.estado === 'RESUELTA' && <Check className="w-3 h-3" />}
              {alerta.estado === 'IGNORADA' && <EyeSlash className="w-3 h-3" />}
              {alerta.estado}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-800 font-hanken mb-1">
            {alerta.titulo}
          </h3>
          <p className="text-slate-500 text-xs leading-normal font-hanken">
            {alerta.descripcion}
          </p>
        </div>

        {/* Separador Vertical Decorativo */}
        <div className="hidden md:block w-px bg-slate-100 self-stretch"></div>

        {/* Lado Derecho: Controles de Gestión */}
        <div className="w-full md:w-[460px] flex flex-col gap-2 shrink-0 justify-between">
          <div className="flex items-center gap-2.5 w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Gestión</span>

            <div className="flex-1 min-w-0">
              <Select
                aria-label="Seleccionar estado"
                placeholder="Seleccionar estado"
                value={estadoSeleccionado}
                onChange={(valor) => {
                  if (valor === 'PENDIENTE' || valor === 'RESUELTA' || valor === 'IGNORADA') {
                    setEstadoSeleccionado(valor)
                  }
                }}
                className="w-full text-xs"
              >
                {/* Gatillo/Botón */}
                <Select.Trigger className="flex justify-between items-center w-full border border-slate-200/80 rounded-lg px-2.5 py-1 bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-700 h-8 font-medium">
                  <Select.Value>
                    <div className="flex items-center gap-1.5">
                      {estadoSeleccionado === 'PENDIENTE' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                      {estadoSeleccionado === 'RESUELTA' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      {estadoSeleccionado === 'IGNORADA' && <EyeSlash className="w-3.5 h-3.5 text-slate-400" />}
                      <span>
                        {estadoSeleccionado === 'PENDIENTE' && 'Pendiente'}
                        {estadoSeleccionado === 'RESUELTA' && 'Resuelta'}
                        {estadoSeleccionado === 'IGNORADA' && 'Ignorado'}
                      </span>
                    </div>
                  </Select.Value>
                  <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
                </Select.Trigger>

                {/* Popover y ListBox */}
                <Select.Popover className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-[150px] z-50">
                  <ListBox>
                    <ListBox.Item
                      id="PENDIENTE"
                      textValue="Pendiente"
                      className="px-2.5 py-1 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Pendiente
                    </ListBox.Item>

                    <ListBox.Item
                      id="RESUELTA"
                      textValue="Resuelta"
                      className="px-2.5 py-1 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Resuelta
                    </ListBox.Item>

                    <ListBox.Item
                      id="IGNORADA"
                      textValue="Ignorado"
                      className="px-2.5 py-1 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <EyeSlash className="w-3.5 h-3.5 text-slate-400" />
                      Ignorado
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <Button
              className="bg-[#1A5F7A] text-white font-semibold gap-1.5 px-3 py-1 text-xs h-8 rounded-md shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
              isPending={cargando}
              onPress={() => { void manejarGuardar() }}
            >
              <FloppyDisk className="w-3.5 h-3.5" />
              Guardar
            </Button>
          </div>

          <TextArea
            aria-label="Motivo del cambio"
            placeholder="Motivo del cambio..."
            rows={3}
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value) }}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:border-slate-300 focus:ring-1 focus:ring-slate-300/50 transition-all outline-none resize-none font-hanken"
          />
        </div>
      </Card.Content>
    </Card>
  )
}
