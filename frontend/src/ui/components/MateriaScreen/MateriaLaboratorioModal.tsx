import { useEffect, useState } from 'react'
import { Modal, Button, Select, ListBox } from '@heroui/react'
import { type Materia } from '../../../core/domain/Materia'
import { type Laboratorio } from '../../../core/domain/Laboratorio'
import { HttpLaboratorioRepository } from '../../../core/infrastructure/adapters/HttpLaboratorioRepository'
import { GetLaboratorios } from '../../../core/application/useCases/Laboratorios/GetLaboratorios'
import { useActiveTerm } from '../../store/activeTermStore'
import { useMateriaLabStore, type LabAssignment } from '../../store/materiaLabStore'

interface MateriaLaboratorioModalProps {
  materia: Materia
}

const repository = new HttpLaboratorioRepository()
const getLaboratoriosUseCase = new GetLaboratorios(repository)

export function MateriaLaboratorioModal ({ materia }: MateriaLaboratorioModalProps) {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { activeTerm } = useActiveTerm()
  const assignments = useMateriaLabStore(state => state.assignments)
  const assignLab = useMateriaLabStore(state => state.assignLab)

  const assignedLab = activeTerm ? assignments[activeTerm.id]?.[materia.codMateria] : undefined
  const selectedPrincipalId = assignedLab?.principal ?? 'ninguno'
  const selectedSecundarioId = assignedLab?.secundario ?? 'ninguno'

  useEffect(() => {
    const cargarLaboratorios = async () => {
      try {
        setError(null)
        const lista = await getLaboratoriosUseCase.execute()
        setLaboratorios(lista)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar laboratorios')
      } finally {
        setCargando(false)
      }
    }
    void cargarLaboratorios()
  }, [])

  const handleGuardarPrincipal = (valorId: string) => {
    if (activeTerm) {
      const isNinguno = valorId === 'ninguno'
      const nuevaAsignacion: LabAssignment | undefined = isNinguno 
        ? undefined 
        : { principal: valorId, secundario: selectedSecundarioId !== 'ninguno' ? selectedSecundarioId : undefined }
      
      assignLab(activeTerm.id, materia.codMateria, nuevaAsignacion)
    }
  }

  const handleGuardarSecundario = (valorId: string) => {
    if (activeTerm) {
      if (selectedPrincipalId === 'ninguno') return 
      const isNinguno = valorId === 'ninguno'
      const nuevaAsignacion: LabAssignment = {
        principal: selectedPrincipalId,
        secundario: isNinguno ? undefined : valorId
      }
      assignLab(activeTerm.id, materia.codMateria, nuevaAsignacion)
    }
  }

  const renderSelect = (
    label: string, 
    selectedValue: string, 
    onChange: (val: string) => void, 
    disabledValue?: string,
    isDisabled: boolean = false
  ) => {
    const nombreSeleccionado = selectedValue === 'ninguno'
      ? 'Ninguno (Sin asignar)'
      : (laboratorios.find(l => l.id === selectedValue)?.name ?? 'Seleccionar laboratorio')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-slate-500">{label}</label>
        <Select
          aria-label={label}
          variant="primary"
          value={selectedValue}
          onChange={(valor) => { if (valor) onChange(String(valor)) }}
          className="w-full text-sm"
          isDisabled={isDisabled}
        >
          <Select.Trigger className={`flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 h-10 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span>{nombreSeleccionado}</span>
            <span className="text-slate-400 text-[10px] ml-2">▼</span>
          </Select.Trigger>
          <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-[260px] z-50">
            <ListBox>
              <ListBox.Item id="ninguno" textValue="Ninguno" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                Ninguno (Sin asignar)
              </ListBox.Item>
              {laboratorios.map((lab) => (
                <ListBox.Item
                  key={lab.id}
                  id={lab.id}
                  textValue={lab.name}
                  isDisabled={lab.id === disabledValue}
                  className={`px-3 py-1.5 text-xs rounded-md block ${
                    lab.id === disabledValue 
                      ? 'text-slate-300 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  {lab.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    )
  }

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

              {/* Encabezado */}
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Asignar Laboratorio
                </Modal.Heading>
              </Modal.Header>

              {/* Cuerpo del modal */}
              <Modal.Body className="px-6 py-5 space-y-4 bg-white">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Materia
                  </span>
                  <h4 className="text-base font-bold text-slate-800 mt-0.5">
                    {materia.nombre}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Esta materia requiere <strong>{materia.horasLab} horas</strong> de laboratorio semanal.
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  {cargando ? (
                    <p className="text-xs text-slate-400 italic animate-pulse">Cargando salas disponibles...</p>
                  ) : error !== null ? (
                    <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">⚠️ {error}</p>
                  ) : (
                    <>
                      {renderSelect('Laboratorio Principal', selectedPrincipalId, handleGuardarPrincipal, selectedSecundarioId)}
                      
                      {renderSelect(
                        'Laboratorio Secundario (Opcional)', 
                        selectedSecundarioId, 
                        handleGuardarSecundario, 
                        selectedPrincipalId,
                        selectedPrincipalId === 'ninguno'
                      )}
                    </>
                  )}
                </div>
              </Modal.Body>

              {/* Botones de acción */}
              <Modal.Footer className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="primary"
                  className="bg-[#1A5F7A] hover:opacity-90 text-white px-5 h-9 rounded-lg text-xs font-semibold cursor-pointer"
                  onPress={close}
                >
                  Cerrar
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
