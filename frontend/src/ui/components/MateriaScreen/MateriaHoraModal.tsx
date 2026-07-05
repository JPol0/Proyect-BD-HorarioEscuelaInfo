import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select, ListBox } from '@heroui/react'
import { type Materia } from '../../../core/domain/Materia'
import { type DaysOfWeek, type Horario } from '../../../core/domain/Horario'
import { ApiHorarioRepository } from '../../../core/infrastructure/adapters/ApiHorarioRepository'
import { ObtenerHorario } from '../../../core/application/useCases/Horarios/ObtenerHorario'
import { useActiveTerm } from '../../store/activeTermStore'

interface MateriaHoraModalProps {
  materia: Materia | null
  onSave: (manualHours: Array<{ nroSeccion: number, dia: DaysOfWeek, hora: string, cantidad: number }>) => void
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

// Algoritmo para agrupar horas individuales (ej. 07:00 y 08:00) en un bloque (ej. 07:00, cantidad: 2)
function agruparTuplasEnBloques(tuplas: Horario[]): ManualBlock[] {
  const bloques: ManualBlock[] = []
  const porDia: Record<string, string[]> = {}
  
  for (const t of tuplas) {
    if (!porDia[t.dia]) porDia[t.dia] = []
    porDia[t.dia].push(t.hora)
  }
  
  for (const dia of Object.keys(porDia)) {
    const horas = porDia[dia].sort()
    if (horas.length === 0) continue
    
    let horaInicio = horas[0]
    let cantidad = 1
    
    for (let i = 1; i < horas.length; i++) {
      const horaActual = parseInt(horas[i].split(':')[0])
      const horaAnterior = parseInt(horas[i-1].split(':')[0])
      
      if (horaActual === horaAnterior + 1) {
        cantidad++
      } else {
        bloques.push({ id: crypto.randomUUID(), dia: dia as DaysOfWeek, hora: horaInicio, cantidad })
        horaInicio = horas[i]
        cantidad = 1
      }
    }
    bloques.push({ id: crypto.randomUUID(), dia: dia as DaysOfWeek, hora: horaInicio, cantidad })
  }
  return bloques
}

function MateriaHoraModalInner({ materia, onSave, close }: { materia: Materia, onSave: MateriaHoraModalProps['onSave'], close: () => void }) {
  const { activeTerm } = useActiveTerm()
  
  const maxSections = Math.max(1, materia.nroSecciones)
  const [currentSection, setCurrentSection] = useState<number>(1)
  const [blocksBySection, setBlocksBySection] = useState<Record<number, ManualBlock[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHorario = async () => {
      const defaultBlocks: Record<number, ManualBlock[]> = {}
      for (let i = 1; i <= maxSections; i++) {
        defaultBlocks[i] = [{ id: crypto.randomUUID(), dia: 'Lunes', hora: '07:00', cantidad: 1 }]
      }

      if (!activeTerm) {
        setBlocksBySection(defaultBlocks)
        setLoading(false)
        return
      }

      try {
        const repo = new ApiHorarioRepository()
        const getSchedule = new ObtenerHorario(repo)
        const tuplas = await getSchedule.execute(activeTerm.id)
        
        const tuplasMateria = tuplas.filter(t => t.codAsig === materia.codMateria)
        
        const initialBlocks: Record<number, ManualBlock[]> = {}
        for (let i = 1; i <= maxSections; i++) {
          const tuplasSeccion = tuplasMateria.filter(t => (t.nroSeccion || 1) === i)
          if (tuplasSeccion.length > 0) {
            initialBlocks[i] = agruparTuplasEnBloques(tuplasSeccion)
          } else {
            initialBlocks[i] = [{ id: crypto.randomUUID(), dia: 'Lunes', hora: '07:00', cantidad: 1 }]
          }
        }
        setBlocksBySection(initialBlocks)
      } catch (e) {
        setBlocksBySection(defaultBlocks)
      } finally {
        setLoading(false)
      }
    }
    void fetchHorario()
  }, [activeTerm, materia.codMateria, maxSections])

  const currentBlocks = blocksBySection[currentSection] || []

  const handleAddBlock = () => {
    setBlocksBySection(prev => ({
      ...prev,
      [currentSection]: [...(prev[currentSection] || []), { id: crypto.randomUUID(), dia: 'Lunes', hora: '07:00', cantidad: 1 }]
    }))
  }

  const handleRemoveBlock = (id: string) => {
    if (currentBlocks.length > 1) {
      setBlocksBySection(prev => ({
        ...prev,
        [currentSection]: (prev[currentSection] || []).filter(b => b.id !== id)
      }))
    }
  }

  const handleBlockChange = (id: string, field: keyof ManualBlock, value: any) => {
    setBlocksBySection(prev => ({
      ...prev,
      [currentSection]: (prev[currentSection] || []).map(b => b.id === id ? { ...b, [field]: value } : b)
    }))
  }

  const handleGuardar = () => {
    const maxHours = materia.horasTeo + materia.horasPrac + materia.horasLab

    const secBlocks = blocksBySection[currentSection] || []
    
    if (secBlocks.some(b => b.cantidad < 1)) {
      alert(`La cantidad de horas debe ser al menos 1 en la Sección ${currentSection}`)
      return
    }
    if (secBlocks.some(b => b.cantidad > 3)) {
      alert(`La cantidad máxima permitida por bloque es de 3 horas en la Sección ${currentSection}`)
      return
    }
    
    const totalAssigned = secBlocks.reduce((sum, b) => sum + b.cantidad, 0)
    if (totalAssigned > maxHours) {
      alert(`La Sección ${currentSection} excede el límite: has asignado ${totalAssigned} horas, pero la materia solo requiere ${maxHours} horas.`)
      return
    }

    const diasAsignados = new Set(secBlocks.map(b => b.dia))
    if (diasAsignados.size !== secBlocks.length) {
      alert(`Solo puedes asignar un máximo de un bloque por día para la Sección ${currentSection}.`)
      return
    }

    const result = secBlocks.map(b => ({ ...b, nroSeccion: currentSection }))
    onSave(result)
    close()
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-[#2a6eea] rounded-full animate-spin mb-4" />
        Cargando bloques asignados...
      </div>
    )
  }

  return (
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
            Horas requeridas: {materia.horasTeo + materia.horasPrac + materia.horasLab} 
            (Teóricas: {materia.horasTeo}, Prácticas: {materia.horasPrac}, Laboratorio: {materia.horasLab})
          </p>
        </div>

        {maxSections > 1 && (
          <div className="mb-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Sección a configurar</span>
            <Select
              variant="primary"
              value={String(currentSection)}
              onChange={(valor) => { if (valor) setCurrentSection(Number(valor)) }}
              className="w-full sm:w-64 text-sm"
            >
              <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-white hover:bg-slate-50 transition-colors text-sm text-slate-700 h-10">
                <Select.Value />
                <Select.Indicator className="text-slate-400 text-[10px] ml-2">▼</Select.Indicator>
              </Select.Trigger>
              <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                <ListBox>
                  {Array.from({ length: maxSections }).map((_, i) => (
                    <ListBox.Item key={i + 1} id={String(i + 1)} textValue={`Sección ${i + 1}`} className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                      Sección {i + 1}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        )}

        <div className="space-y-4">
          {currentBlocks.map((block) => (
            <div key={block.id} className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
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

              <div className="w-full sm:w-[25%] flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Cant. Horas</span>
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={block.cantidad.toString()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    handleBlockChange(block.id, 'cantidad', Math.min(Math.max(1, val), 3))
                  }}
                  variant="primary"
                  className="w-full text-sm h-10"
                />
              </div>

              <div className="pb-1">
                <button
                  onClick={() => handleRemoveBlock(block.id)}
                  disabled={currentBlocks.length === 1}
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
          onPress={handleGuardar}
        >
          Asignar Horas
        </Button>
      </Modal.Footer>
    </>
  )
}

export function MateriaHoraModal ({ materia, onSave }: MateriaHoraModalProps) {
  if (!materia) return null

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans border border-slate-100">
          {({ close }) => (
            <MateriaHoraModalInner materia={materia} onSave={onSave} close={close} />
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
