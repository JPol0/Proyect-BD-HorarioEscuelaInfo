import { useEffect, useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import { Magnifier } from '@gravity-ui/icons'
import type { Materia } from '../../../core/domain/Materia'
import type { Profesor } from '../../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../../core/application/useCases/Profesores/GetProfesores'
import { SaveSeccion } from '../../../core/application/useCases/Secciones/SaveSeccion'
import { HttpSeccionRepository } from '../../../core/infrastructure/adapters/HttpSeccionRepository'
import { useSeccionProfesorStore } from '../../store/seccionProfesorStore'
import { useActiveTerm } from '../../store/activeTermStore'

interface MateriaProfesorModalProps {
  materia: Materia
  currentSection: number
}

const repository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(repository)
const seccionRepository = new HttpSeccionRepository()
const saveSeccionUseCase = new SaveSeccion(seccionRepository)

export function MateriaProfesorModal ({ materia, currentSection }: MateriaProfesorModalProps) {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [tipoHoras, setTipoHoras] = useState<'Teoría' | 'Laboratorio'>('Teoría')
  const { activeTerm } = useActiveTerm()

  const assignments = useSeccionProfesorStore(state => state.assignments)
  const assignmentsLab = useSeccionProfesorStore(state => state.assignmentsLab)
  const assignProfesor = useSeccionProfesorStore(state => state.assignProfesor)
  const assignProfesorLab = useSeccionProfesorStore(state => state.assignProfesorLab)

  const assignedCedula = activeTerm
    ? (tipoHoras === 'Teoría'
        ? assignments[activeTerm.id]?.[materia.codMateria]?.[currentSection]
        : assignmentsLab?.[activeTerm.id]?.[materia.codMateria]?.[currentSection])
    : undefined

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null)
        const lista = await getProfesoresUseCase.execute()
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

                {materia.horasLab > 0 && (
                  <div className="flex gap-2 p-1 bg-surface-alt rounded-lg">
                    <button
                      onClick={() => { setTipoHoras('Teoría') }}
                      className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${tipoHoras === 'Teoría' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                      Horas Teóricas
                    </button>
                    <button
                      onClick={() => { setTipoHoras('Laboratorio') }}
                      className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${tipoHoras === 'Laboratorio' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                      Horas de Laboratorio
                    </button>
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
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                    Asignado
                                  </span>
                                  <button
                                    className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
                                    onClick={() => {
                                      if (activeTerm) {
                                        if (tipoHoras === 'Teoría') {
                                          assignProfesor(activeTerm.id, materia.codMateria, currentSection, undefined)
                                        } else {
                                          assignProfesorLab(activeTerm.id, materia.codMateria, currentSection, undefined)
                                        }
                                        void saveSeccionUseCase.execute({
                                          codTerm: activeTerm.id,
                                          codMateria: materia.codMateria,
                                          nroSeccion: currentSection,
                                          profesorAsignado: null
                                        })
                                      }
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )
                              : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isDisabled={!!assignedCedula}
                                  onPress={() => {
                                    if (activeTerm) {
                                      if (tipoHoras === 'Teoría') {
                                        assignProfesor(activeTerm.id, materia.codMateria, currentSection, profesor.cedula)
                                      } else {
                                        assignProfesorLab(activeTerm.id, materia.codMateria, currentSection, profesor.cedula)
                                      }
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
