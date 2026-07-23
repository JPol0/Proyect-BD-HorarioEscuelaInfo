import { useState } from 'react'
import { Modal, Button, Select, ListBox } from '@heroui/react'
import { Gear, PersonPlus, Microscope, Clock } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'
import { type DaysOfWeek } from '../../../core/domain/Horario'
import { MateriaProfesorModal } from './MateriaProfesorModal'
import { MateriaLaboratorioModal } from './MateriaLaboratorioModal'
import { MateriaHoraModal } from './MateriaHoraModal'

const convertirARomano = (num: number): string => {
  const valoresRomanos: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let resultado = ''
  let valorRestante = num
  for (const key in valoresRomanos) {
    while (valorRestante >= valoresRomanos[key]) {
      resultado += key
      valorRestante -= valoresRomanos[key]
    }
  }
  return resultado
}

interface MateriaConfiguracionModalProps {
  materia: Materia
  onAssignHours?: (materia: Materia, manualHours: Array<{ nroSeccion: number, dia: DaysOfWeek, hora: string, cantidad: number }>) => void
}

export function MateriaConfiguracionModal ({ materia, onAssignHours }: MateriaConfiguracionModalProps) {
  const [currentSection, setCurrentSection] = useState(1)
  const maxSections = Math.max(1, materia.nroSecciones)

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-40">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

              <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Gear className="w-5 h-5 text-slate-500" />
                  Configuración
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="px-6 py-5 space-y-5 bg-white">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {materia.codMateria}
                  </span>
                  <h4 className="text-base font-bold text-slate-800 mt-0.5">
                    {materia.nombre}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Horas requeridas: {materia.horasTeo + materia.horasPrac + materia.horasLab}
                    {' '}(Teóricas: {materia.horasTeo}, Prácticas: {materia.horasPrac}, Laboratorio: {materia.horasLab})
                  </p>
                </div>

                {materia.horasLab > 0 && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuración General</span>
                    <Modal>
                      <Button
                        variant="secondary"
                        className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2 border border-slate-200"
                      >
                        <Microscope className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        Asignar Laboratorio
                      </Button>
                      <MateriaLaboratorioModal materia={materia} />
                    </Modal>
                  </div>
                )}

                {maxSections > 0 && (
                  <div className="mb-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuración por Sección</span>
                    <Select
                      variant="primary"
                      value={String(currentSection)}
                      onChange={(valor) => { if (valor) setCurrentSection(Number(valor)) }}
                      className="w-full text-sm"
                    >
                      <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-white hover:bg-slate-50 transition-colors text-sm text-slate-700 h-10 mt-1">
                        <Select.Value />
                        <Select.Indicator className="text-slate-400 text-[10px] ml-2">▼</Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                        <ListBox>
                          {Array.from({ length: maxSections }).map((_, i) => (
                            <ListBox.Item key={i + 1} id={String(i + 1)} textValue={`Sección ${convertirARomano(i + 1)}`} className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                              Sección {convertirARomano(i + 1)}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200">
                      <Modal>
                        <Button
                          variant="secondary"
                          className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <PersonPlus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          Asignar Profesores
                        </Button>
                        <MateriaProfesorModal materia={materia} currentSection={currentSection} />
                      </Modal>

                      {materia.esComun && (
                        <Modal>
                          <Button
                            variant="secondary"
                            className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2 border border-slate-200"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            Asignar Horas
                          </Button>
                          <MateriaHoraModal
                            materia={materia}
                            currentSection={currentSection}
                            onSave={(manualHours) => {
                              if (onAssignHours) {
                                onAssignHours(materia, manualHours)
                              }
                            }}
                          />
                        </Modal>
                      )}
                    </div>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="secondary" className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-5 h-9 cursor-pointer" onPress={close}>
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
