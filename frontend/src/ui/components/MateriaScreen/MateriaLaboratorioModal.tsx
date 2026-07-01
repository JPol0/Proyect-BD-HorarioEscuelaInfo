import { useEffect, useState } from 'react'
import { Modal, Button, Select, ListBox } from '@heroui/react'
import { type Materia } from '../../../core/domain/Materia'
import { type Laboratorio } from '../../../core/domain/Laboratorio'
import { HttpLaboratorioRepository } from '../../../core/infrastructure/adapters/HttpLaboratorioRepository'
import { GetLaboratorios } from '../../../core/application/useCases/Laboratorios/GetLaboratorios'

interface MateriaLaboratorioModalProps {
  materia: Materia
  onSave?: (materia: Materia) => void
}

const repository = new HttpLaboratorioRepository()
const getLaboratoriosUseCase = new GetLaboratorios(repository)

export function MateriaLaboratorioModal ({ materia, onSave }: MateriaLaboratorioModalProps) {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLabId, setSelectedLabId] = useState<string>(materia.laboratorioId ?? 'ninguno')

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

  const handleGuardar = (close: () => void) => {
    if (onSave) {
      onSave({
        ...materia,
        laboratorioId: selectedLabId === 'ninguno' ? undefined : selectedLabId
      })
    }
    close()
  }

  // Nombre del laboratorio seleccionado para mostrar en el valor del Select
  const nombreSeleccionado = selectedLabId === 'ninguno'
    ? 'Ninguno (Sin asignar)'
    : (laboratorios.find(l => l.id === selectedLabId)?.name ?? 'Seleccionar laboratorio')

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100">
          {({ close }) => (
            <>
              {/* Botón X de cierre */}
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

                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-xs font-semibold text-slate-500">Laboratorio Asignado</span>
                  {cargando
                    ? (
                    <p className="text-xs text-slate-400 italic animate-pulse">Cargando salas disponibles...</p>
                      )
                    : error !== null
                      ? (
                      <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">⚠️ {error}</p>
                        )
                      : (
                      <Select
                        aria-label="Seleccionar laboratorio"
                        variant="primary"
                        value={selectedLabId}
                        onChange={(valor) => {
                          if (valor) setSelectedLabId(String(valor))
                        }}
                        className="w-full text-xs"
                      >
                        <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 h-10">
                          <span>{nombreSeleccionado}</span>
                          <span className="text-slate-400 text-[10px]">▼</span>
                        </Select.Trigger>

                        <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-[260px] z-50">
                          <ListBox>
                            <ListBox.Item id="ninguno" textValue="Ninguno" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block font-semibold text-slate-500">
                              Ninguno (Sin asignar)
                            </ListBox.Item>
                            {laboratorios.map((lab) => (
                              <ListBox.Item
                                key={lab.id}
                                id={lab.id}
                                textValue={lab.name}
                                className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                              >
                                {lab.name}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                        )}
                </div>
              </Modal.Body>

              {/* Botones de acción */}
              <Modal.Footer className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 h-9 rounded-lg text-xs font-semibold cursor-pointer"
                  onPress={close}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="bg-[#1A5F7A] hover:opacity-90 text-white px-5 h-9 rounded-lg text-xs font-semibold cursor-pointer"
                  onPress={() => { handleGuardar(close) }}
                >
                  Guardar
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
