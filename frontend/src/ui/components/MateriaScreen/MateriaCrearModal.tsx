import { useState } from 'react'
import { Modal, Button, Input, Select, ListBox } from '@heroui/react'
import { type Materia, type MateriaModalidad } from '../../../core/domain/Materia'

interface MateriaCrearModalProps {
  onSave?: (materia: Omit<Materia, 'codMateria'>) => void
}

export function MateriaCrearModal ({ onSave }: MateriaCrearModalProps) {
  // Estados locales para los campos del formulario
  const [nombre, setNombre] = useState('')
  const [semestre, setSemestre] = useState(1)
  const [horasTeoricas, setHorasTeoricas] = useState(4)
  const [horasLab, setHorasLab] = useState(0)
  const [modalidad, setModalidad] = useState<MateriaModalidad>('PRE')
  const [esComun, setEsComun] = useState<string>('no')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  const handleCrear = (close: () => void) => {
    if (!nombre.trim()) {
      setErrorLocal('El nombre de la materia es obligatorio.')
      return
    }

    if (onSave) {
      onSave({
        nombre: nombre.trim(),
        semestre: Number(semestre),
        horasTeo: Number(horasTeoricas),
        horasLab: Number(horasLab),
        modalidad,
        esComun: esComun === 'si',
        nroSecciones: 1, // Por defecto al crear una materia
        preReq: []
      })
    }

    // Resetear formulario para futuros usos
    setNombre('')
    setSemestre(1)
    setHorasTeoricas(4)
    setHorasLab(0)
    setModalidad('PRE')
    setEsComun('no')
    setErrorLocal(null)

    close()
  }

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden font-sans border border-slate-100">
          {({ close }) => (
            <>
              {/* Botón X de cierre elegante */}
              <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

              {/* Encabezado del Modal */}
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Crear Nueva Asignatura
                </Modal.Heading>
              </Modal.Header>

              {/* Cuerpo del Formulario distribuido en Grid */}
              <Modal.Body className="px-6 py-5 space-y-5 bg-white">
                {errorLocal && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 font-semibold">
                    {errorLocal}
                  </div>
                )}

                {/* Fila 1: Nombre completo */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Nombre de la Asignatura</span>
                  <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value)
                      setErrorLocal(null)
                    }}
                    placeholder="Ej. Introducción a la Computación"
                    variant="primary"
                    className="w-full text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Fila 2: Semestre */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Semestre Académico</span>
                  <Input
                    type="number"
                    value={semestre.toString()}
                    onChange={(e) => setSemestre(Number(e.target.value))}
                    min={1}
                    variant="primary"
                    className="w-full text-sm"
                  />
                </div>

                {/* Fila 3: Horas de Teoría y Horas de Laboratorio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">Horas Teóricas</span>
                    <Input
                      type="number"
                      value={horasTeoricas.toString()}
                      onChange={(e) => setHorasTeoricas(Number(e.target.value))}
                      min={0}
                      variant="primary"
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">Horas de Laboratorio</span>
                    <Input
                      type="number"
                      value={horasLab.toString()}
                      onChange={(e) => setHorasLab(Number(e.target.value))}
                      min={0}
                      variant="primary"
                      className="w-full text-sm"
                    />
                  </div>
                </div>

                {/* Fila 4: Modalidad y Es Común */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Selector Modalidad */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">Modalidad</span>
                    <Select
                      variant="primary"
                      value={modalidad}
                      onChange={(valor) => { if (valor) setModalidad(valor as MateriaModalidad) }}
                      className="w-full text-xs"
                    >
                      <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-700 h-9">
                        <Select.Value />
                        <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                        <ListBox>
                          <ListBox.Item id="PRE" textValue="Presencial" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                            Presencial (PRE)
                          </ListBox.Item>
                          <ListBox.Item id="VIT" textValue="Virtual" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                            Virtual (VIT)
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  {/* Selector Materia Común */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">¿Es Materia Comun?</span>
                    <Select
                      variant="primary"
                      value={esComun}
                      onChange={(valor) => { if (valor) setEsComun(String(valor)) }}
                      className="w-full text-xs"
                    >
                      <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-700 h-9">
                        <Select.Value />
                        <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                        <ListBox>
                          <ListBox.Item id="no" textValue="No" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                            No
                          </ListBox.Item>
                          <ListBox.Item id="si" textValue="Sí" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                            Sí
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                </div>

              </Modal.Body>

              {/* Botones de acción inferiores */}
              <Modal.Footer className="px-6 pb-6 pt-4 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/30">
                <Button
                  slot="close"
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs h-9 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  onPress={() => handleCrear(close)}
                >
                  Crear Materia
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
