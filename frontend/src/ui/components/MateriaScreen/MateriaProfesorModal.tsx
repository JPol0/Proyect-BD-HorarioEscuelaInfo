import { useEffect, useState } from 'react'
import { Modal, Button, Input, Select, ListBox } from '@heroui/react'
import { Magnifier } from '@gravity-ui/icons'
import type { Materia } from '../../../core/domain/Materia'
import type { Profesor } from '../../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../../core/application/useCases/Profesores/GetProfesores'
import { SaveSeccion } from '../../../core/application/useCases/Secciones/SaveSeccion'
import { HttpSeccionRepository } from '../../../core/infrastructure/adapters/HttpSeccionRepository'
import { useSeccionProfesorStore } from '../../store/seccionProfesorStore'
import { useActiveTerm } from '../../store/activeTermStore'

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

interface MateriaProfesorModalProps {
  materia: Materia
}

const repository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(repository)
const seccionRepository = new HttpSeccionRepository()
const saveSeccionUseCase = new SaveSeccion(seccionRepository)

export function MateriaProfesorModal ({ materia }: MateriaProfesorModalProps) {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [currentSection, setCurrentSection] = useState(1)
  const { activeTerm } = useActiveTerm()

  const assignments = useSeccionProfesorStore(state => state.assignments)
  const assignedCedula = activeTerm ? assignments[activeTerm.id]?.[materia.codMateria]?.[currentSection] : undefined
  const maxSections = Math.max(1, materia.nroSecciones)

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null)
        const lista = await getProfesoresUseCase.execute()
        // Solo mostrar profesores activos
        setProfesores(lista.filter((p) => p.status === 'A'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar profesores')
      } finally {
        setCargando(false)
      }
    }
    void cargar()
  }, [])

  const profesoresFiltrados = profesores.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cedula.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-text-muted hover:text-text-secondary cursor-pointer" />
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-border bg-surface-alt">
                <Modal.Heading className="text-lg font-bold text-titlePage flex flex-col gap-0.5">
                  Asignar Profesores
                  <span className="text-sm font-normal text-subtitlePage">{materia.nombre}</span>
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="px-6 py-5 space-y-4 bg-surface max-h-[70vh] overflow-y-auto">
                {error != null && (
                  <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">⚠️ {error}</p>
                )}

                {maxSections > 0 && (
                  <div className="mb-2 p-4 bg-surface-alt rounded-xl border border-border flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-subtitlePage">Sección a configurar</span>
                    <div className="flex gap-4 items-center">
                      <Select
                        variant="primary"
                        value={String(currentSection)}
                        onChange={(valor) => { if (valor) setCurrentSection(Number(valor)) }}
                        className="w-full sm:w-64 text-sm"
                      >
                        <Select.Trigger className="flex justify-between items-center w-full border border-border rounded-lg px-3 bg-surface hover:bg-surface-alt transition-colors text-sm text-text-primary h-10">
                          <Select.Value />
                          <Select.Indicator className="text-text-muted text-[10px] ml-2">▼</Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover placement="bottom start" className="bg-surface border border-border shadow-lg rounded-lg p-1 min-w-45 z-50">
                          <ListBox>
                            {Array.from({ length: maxSections }).map((_, i) => (
                              <ListBox.Item
                                key={i + 1}
                                id={String(i + 1)}
                                textValue={`Sección ${convertirARomano(i + 1)}`}
                                className="px-3 py-1.5 text-xs text-text-primary rounded-md hover:bg-surface-alt cursor-pointer block"
                              >
                                Sección {convertirARomano(i + 1)}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      {assignedCedula && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10"
                          onPress={() => {
                            if (activeTerm) {
                              void saveSeccionUseCase.execute({
                                codTerm: activeTerm.id,
                                codMateria: materia.codMateria,
                                nroSeccion: currentSection,
                                profesorAsignado: null
                              })
                            }
                          }}
                        >
                          Eliminar profesor
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative w-full flex items-center">
                  <span className="absolute left-3 z-10 pointer-events-none flex items-center">
                    <Magnifier className="text-text-muted w-4 h-4" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Buscar profesor..."
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value) }}
                    className="w-full pl-9 pr-3 text-sm h-9 border border-border rounded-lg bg-surface-alt"
                  />
                </div>

                {cargando
                  ? <p className="text-xs text-text-muted italic animate-pulse">Cargando profesores...</p>
                  : profesoresFiltrados.length === 0
                    ? <div className="text-sm text-text-muted">No se encontraron profesores activos con ese criterio.</div>
                    : (
                      <div className="space-y-2">
                        {profesoresFiltrados.map((profesor) => (
                          <div key={profesor.cedula} className="flex items-center justify-between rounded-lg border border-border bg-surface-alt p-3">
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{profesor.nombre}</p>
                              <p className="text-xs text-text-muted">{profesor.cedula}</p>
                            </div>
                            {assignedCedula === profesor.cedula
                              ? (
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                  Asignado
                                </span>
                              )
                              : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isDisabled={!!assignedCedula}
                                  onPress={() => {
                                    if (activeTerm) {
                                      void saveSeccionUseCase.execute({
                                        codTerm: activeTerm.id,
                                        codMateria: materia.codMateria,
                                        nroSeccion: currentSection,
                                        profesorAsignado: profesor
                                      })
                                    }
                                  }}
                                  className="text-xs"
                                >
                                  Seleccionar
                                </Button>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
              </Modal.Body>

              <Modal.Footer className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-3">
                <Button
                  variant="secondary"
                  className="bg-surface hover:bg-surface-alt text-text-secondary font-medium text-xs px-5 h-9 cursor-pointer"
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
