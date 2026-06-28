import { useState } from 'react'
import { Card, Button, Select, TextArea, ListBox } from '@heroui/react'
import { FloppyDisk } from '@gravity-ui/icons'
import { type Alerta, type EstadoAlerta } from '../../../core/domain/Alarm'

interface AlertCardProps {
  alerta: Alerta
  onGuardar: (id: string, nuevoEstado: EstadoAlerta, motivo?: string) => Promise<void>
}

export function AlertCard ({ alerta, onGuardar }: AlertCardProps) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoAlerta>('PENDIENTE')
  const [motivo, setMotivo] = useState('')
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
    <Card className="mb-5 shadow-sm border border-gray-100 rounded-xl bg-white">
      <Card.Content className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start">

        {/* Lado Izquierdo: Información del Conflicto */}
        <div className="flex-1 min-w-0">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md mb-3 tracking-wide">
            {alerta.estado}
          </span>
          <h3 className="text-xl font-bold text-slate-800 font-hanken mb-2">
            {alerta.titulo}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {alerta.descripcion}
          </p>
        </div>

        {/* Separador Vertical Decorativo */}
        <div className="hidden md:block w-px bg-slate-200 self-stretch"></div>

        {/* Lado Derecho: Controles de Gestión */}
        <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Estado</span>

            <Button
              className="bg-[#1A5F7A] text-white font-medium gap-2 px-3 py-1.5 text-xs h-auto rounded-md shadow-sm hover:opacity-90 transition-opacity"
              isPending={cargando}
              onPress={() => { void manejarGuardar() }}
            >
              <FloppyDisk className="w-4 h-4" />
              Guardar
            </Button>
          </div>

          {/* SELECT CORREGIDO: Usa value y onChange directo (sin eventos de target) */}

            <Select
            aria-label="Seleccionar estado"
            placeholder="Seleccionar estado" // 1. El placeholder va aquí arriba
            value={estadoSeleccionado}
            onChange={(valor) => {
              // Validación segura para TypeScript
              if (valor === 'PENDIENTE' || valor === 'RESUELTA' || valor === 'IGNORADA') {
                setEstadoSeleccionado(valor)
              }
            }}
            className="w-full text-xs"
                >
                {/* Gatillo/Botón */}
                <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg p-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Select.Value /> {/* 2. Queda limpio, sin props */}
                    <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
                </Select.Trigger>

                {/* Popover y ListBox */}
                <Select.Popover className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-[150px]">
                    {/* 3. Debes envolver las opciones en un ListBox */}
                    <ListBox>
                    {/* 4. Cambiamos Select.Item por ListBox.Item y 'key' por 'id' */}
                    <ListBox.Item
                        id="PENDIENTE"
                        textValue="Pendiente"
                        className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                    >
                        Pendiente
                    </ListBox.Item>

                    <ListBox.Item
                        id="RESUELTA"
                        textValue="Resuelta"
                        className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                    >
                        Resuelta
                    </ListBox.Item>

                    <ListBox.Item
                        id="IGNORADA"
                        textValue="Ignorado"
                        className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                    >
                        Ignorado
                    </ListBox.Item>
                    </ListBox>
                </Select.Popover>
            </Select>

          {/* TEXTAREA CORREGIDO: Eliminado size/minRows y cambiado por rows y text-xs */}
          <TextArea
            aria-label="Motivo del cambio"
            placeholder="Motivo del cambio..."
            rows={2}
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value) }}
            className="w-full text-xs p-2"
          />
        </div>
      </Card.Content>
    </Card>
  )
}
