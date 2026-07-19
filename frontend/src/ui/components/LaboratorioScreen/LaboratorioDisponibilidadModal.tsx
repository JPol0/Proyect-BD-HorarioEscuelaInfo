import { useState, useEffect, useMemo } from 'react'
import { Modal, Select, ListBox } from '@heroui/react'
import { type Laboratorio } from '../../../core/domain/Laboratorio'
import { HttpDisponibilidadLaboratorioRepository } from '../../../core/infrastructure/adapters/HttpDisponibilidadLaboratorioRepository'
import { ObtenerDisponibilidadLaboratorio } from '../../../core/application/useCases/DisponibilidadLaboratorio/ObtenerDisponibilidadLaboratorio'
import { useActiveTerm } from '../../store/activeTermStore'
import { type DaysOfWeek } from '../../../core/domain/Horario'
import { type DisponibilidadLaboratorio } from '../../../core/domain/DisponibilidadLaboratorio'
import { Clock } from '@gravity-ui/icons'

interface LaboratorioDisponibilidadModalProps {
  laboratorios: Laboratorio[]
  initialLabId: number
}

function LaboratorioDisponibilidadInner ({ laboratorios, initialLabId }: { laboratorios: Laboratorio[], initialLabId: number }) {
  const { activeTerm } = useActiveTerm()
  const [selectedLabId, setSelectedLabId] = useState<number>(initialLabId)
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadLaboratorio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!activeTerm || !selectedLabId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const repo = new HttpDisponibilidadLaboratorioRepository()
        const getDisponibilidad = new ObtenerDisponibilidadLaboratorio(repo)
        const data = await getDisponibilidad.execute(selectedLabId, activeTerm.id)
        setDisponibilidad(data)
      } catch (e) {
        console.error('Error al cargar la disponibilidad', e)
      } finally {
        setLoading(false)
      }
    }
    void fetchDisponibilidad()
  }, [activeTerm, selectedLabId])

  const scheduleRows = useMemo(() => {
    const baseHours = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00', '22:00'
    ]
    const days: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

    return baseHours.map(hour => {
      const row: Record<string, string> = { hour }
      for (const day of days) {
        const celda = disponibilidad.find(t => (t.dia as string) === day && t.hora === hour)
        if (celda && celda.ocupado) {
          row[day] = 'Ocupado'
        } else {
          row[day] = '-'
        }
      }
      return row
    })
  }, [disponibilidad])

  const Cell = ({ value }: { value: string }) => {
    if (value === '-') return <span className="text-slate-300">—</span>
    return <span className="text-red-500 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">{value}</span>
  }

  return (
    <>
      <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

      <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#2a6eea]" />
          Disponibilidad de Laboratorios
        </Modal.Heading>

        <div className="w-full sm:w-64">
          <Select
            variant="primary"
            value={selectedLabId}
            onChange={(valor) => { if (valor) setSelectedLabId(Number(valor)) }}
            className="w-full text-sm"
          >
            <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-white hover:bg-slate-50 transition-colors text-sm text-slate-700 h-10">
              <Select.Value />
              <Select.Indicator className="text-slate-400 text-[10px] ml-2">▼</Select.Indicator>
            </Select.Trigger>
            <Select.Popover placement="bottom end" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50 max-h-60 overflow-y-auto">
              <ListBox>
                {laboratorios.map(lab => (
                  <ListBox.Item key={lab.id} id={lab.id} textValue={lab.name} className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                    {lab.name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0 bg-white max-h-[75vh] overflow-y-auto">
        {loading
          ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[#2a6eea] rounded-full animate-spin mb-4" />
            Cargando disponibilidad...
          </div>
            )
          : (
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full border-collapse min-w-[760px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-slate-200">
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white w-px">Hora</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Lunes</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Martes</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Miércoles</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Jueves</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Viernes</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Sábado</th>
                  <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border-l border-slate-100 w-[14.28%]">Domingo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scheduleRows.map((row) => (
                  <tr key={row.hour} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-[12px] font-bold text-[#14233f] whitespace-nowrap bg-slate-50 text-center w-px">
                      {`${row.hour} - ${row.hour.split(':')[0]}:59`}
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Lunes} />
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Martes} />
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Miercoles} />
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Jueves} />
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Viernes} />
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Sabado} />
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] border-l border-slate-100">
                      <Cell value={row.Domingo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            )}
      </Modal.Body>
    </>
  )
}

export function LaboratorioDisponibilidadModal ({ laboratorios, initialLabId }: LaboratorioDisponibilidadModalProps) {
  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden font-sans border border-slate-100">
          {() => (
            <LaboratorioDisponibilidadInner laboratorios={laboratorios} initialLabId={initialLabId} />
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
