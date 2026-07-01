import { useState } from 'react'
import { Modal, Button, Input, Select, ListBox } from '@heroui/react'
import { type Materia } from '../../../core/domain/Materia'
import { type DaysOfWeek } from '../../../core/domain/Horario'

interface MateriaHoraModalProps {
  materia: Materia | null
  onSave: (manualHours: Array<{ dia: DaysOfWeek, hora: string, cantidad: number }>) => void
}

export interface ManualBlock {
  id: string
  dia: DaysOfWeek
  hora: string
  cantidad: number
}

const DIAS: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const HORAS_INICIO = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00'
]

export function MateriaHoraModal ({ materia, onSave }: MateriaHoraModalProps) {
  const [blocks, setBlocks] = useState<ManualBlock[]>([
    { id: crypto.randomUUID(), dia: 'Lunes', hora: '07:00', cantidad: 1 }
  ])

  if (!materia) return null

  const handleAddBlock = () => {
    setBlocks([...blocks, { id: crypto.randomUUID(), dia: 'Lunes', hora: '07:00', cantidad: 1 }])
  }

  const handleRemoveBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id))
    }
  }

  const handleBlockChange = (id: string, field: keyof ManualBlock, value: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b))
  }

  const handleGuardar = (close: () => void) => {
    if (blocks.some(b => b.cantidad < 1)) {
      alert('La cantidad de horas debe ser al menos 1')
      return
    }
    onSave(blocks)
    close()
  }

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans border border-slate-100">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

              <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Asignar Horas
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="px-6 py-5 space-y-5 bg-white max-h-[70vh] overflow-y-auto">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">{materia.codMateria} - {materia.nombre}</h3>
                  <p className="text-xs text-slate-500">
                    Horas requeridas: {materia.horasTeo + materia.horasLab} (Teóricas: {materia.horasTeo}, Laboratorio: {materia.horasLab})
                  </p>
                </div>

                <div className="space-y-4">
                  {blocks.map((block) => (
                    <div key={block.id} className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      {/* Selector de Día */}
                      <div className="w-full sm:w-[30%] flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Día</span>
                        <Select
                          variant="primary"
                          value={block.dia}
                          onChange={(valor) => { if (valor) handleBlockChange(block.id, 'dia', valor as DaysOfWeek) }}
                          className="w-full text-xs"
                        >
                          <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-white hover:bg-slate-50 transition-colors text-sm text-slate-700 h-10">
                            <Select.Value />
                            <Select.Indicator className="text-slate-400 text-[10px] ml-2">▼</Select.Indicator>
                          </Select.Trigger>
                          <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                            <ListBox>
                              {DIAS.map(dia => (
                                <ListBox.Item key={dia} id={dia} textValue={dia} className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                                  {dia}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>
                      {/* Selector de Hora */}
                      <div className="w-full sm:w-[30%] flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Hora Inicio</span>
                        <Select
                          variant="primary"
                          value={block.hora}
                          onChange={(valor) => { if (valor) handleBlockChange(block.id, 'hora', valor) }}
                          className="w-full text-xs"
                        >
                          <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-white hover:bg-slate-50 transition-colors text-sm text-slate-700 h-10">
                            <Select.Value />
                            <Select.Indicator className="text-slate-400 text-[10px] ml-2">▼</Select.Indicator>
                          </Select.Trigger>
                          <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50 max-h-60 overflow-y-auto">
                            <ListBox>
                              {HORAS_INICIO.map(hora => (
                                <ListBox.Item key={hora} id={hora} textValue={hora} className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                                  {hora}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>

                      {/* Cantidad Horas */}
                      <div className="w-full sm:w-[25%] flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Cant. Horas</span>
                        <Input
                          type="number"
                          value={block.cantidad.toString()}
                          onChange={(e) => handleBlockChange(block.id, 'cantidad', parseInt(e.target.value) || 1)}
                          variant="primary"
                          className="w-full text-sm h-10"
                        />
                      </div>

                      {/* Botón Eliminar */}
                      <div className="pb-1">
                        <button
                          onClick={() => handleRemoveBlock(block.id)}
                          disabled={blocks.length === 1}
                          className="h-8 w-8 flex justify-center items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                          title="Eliminar bloque"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddBlock}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#2a6eea] hover:text-[#1c55c2] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Agregar otro bloque
                </button>
              </Modal.Body>

              <Modal.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-5 h-9 cursor-pointer"
                  onPress={close}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="bg-[#2a6eea] hover:bg-[#1f5bc6] text-white font-medium text-xs px-5 h-9 cursor-pointer"
                  onPress={() => handleGuardar(close)}
                >
                  Asignar Horas
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
