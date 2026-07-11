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

  const assignedTeoriaCedula = activeTerm ? assignments[activeTerm.id]?.[materia.codMateria]?.[currentSection] : undefined
  const assignedLabCedula = activeTerm ? assignmentsLab?.[activeTerm.id]?.[materia.codMateria]?.[currentSection] : undefined

  const assignedTeoria = profesores.find(p => p.cedula === assignedTeoriaCedula)
  const assignedLab = profesores.find(p => p.cedula === assignedLabCedula)

  // Solo mostrar sección de laboratorio si la materia tiene horas de lab
  const hasAnyAssignment = !!assignedTeoria || (materia.horasLab > 0 && !!assignedLab)

  // El profesor que está asignado en la pestaña actual (para saber si deshabilitar selección)
  const assignedCedulaActual = tipoHoras === 'Teoría' ? assignedTeoriaCedula : assignedLabCedula

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
        <Modal.Dialog className={`bg-surface rounded-xl shadow-2xl w-full transition-all duration-300 overflow-hidden border border-border flex flex-col ${hasAnyAssignment ? 'max-w-4xl' : 'max-w-2xl'}`}>
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-text-muted hover:text-text-secondary cursor-pointer z-10" />
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-border bg-surface-alt">
                <Modal.Heading className="text-lg font-bold text-titlePage flex flex-col gap-0.5">
                  Asignar Profesores
                  <span className="text-sm font-normal text-subtitlePage">{materia.nombre}</span>
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="p-0 flex flex-row max-h-[65vh]">
                {/* --- Columna Izquierda: Búsqueda y Selección --- */}
                <div className={`flex flex-col flex-1 p-6 overflow-y-auto ${hasAnyAssignment ? 'border-r border-border' : ''}`}>
                  {error != null && (
                    <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">⚠️ {error}</p>
                  )}

                  {materia.horasLab > 0 && (
                    <div className="flex gap-2 p-1 bg-surface-alt rounded-lg mb-4 shrink-0">
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

                  <div className="relative w-full flex items-center mb-4 shrink-0">
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
                        <div className="space-y-2 pb-2">
                          {profesoresFiltrados.map((profesor) => {
                            // Determinar si este profesor en específico está asignado en la pestaña actual
                            const isAssignedHere = assignedCedulaActual === profesor.cedula

                            return (
                              <div key={profesor.cedula} className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${isAssignedHere ? 'border-primary/40 bg-primary/5' : 'border-border bg-surface-alt hover:border-slate-300'}`}>
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{profesor.nombre}</p>
                                  <p className="text-xs text-text-muted">{profesor.cedula}</p>
                                </div>
                                
                                {isAssignedHere ? (
                                  <span className="text-xs font-semibold text-primary px-3 py-1.5 bg-primary/10 rounded-lg">
                                    Seleccionado
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    isDisabled={!!assignedCedulaActual}
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
                                    className="text-xs border-slate-200"
                                  >
                                    Asignar
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                </div>

                {/* --- Columna Derecha: Profesores Asignados --- */}
                {hasAnyAssignment && (
                  <div className="w-[320px] bg-surface-alt p-6 flex flex-col shrink-0 overflow-y-auto">
                    <h3 className="text-sm font-bold text-titlePage mb-5 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profesores Asignados
                    </h3>
                    
                    <div className="space-y-4">
                      {assignedTeoria && (
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">Horas Teóricas</span>
                          </div>
                          <p className="text-sm font-bold text-text-primary mb-0.5 line-clamp-1" title={assignedTeoria.nombre}>{assignedTeoria.nombre}</p>
                          <p className="text-xs text-text-muted mb-4">{assignedTeoria.cedula}</p>
                          <button
                            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition-colors cursor-pointer"
                            onClick={() => {
                              if (activeTerm) {
                                assignProfesor(activeTerm.id, materia.codMateria, currentSection, undefined)
                                void saveSeccionUseCase.execute({
                                  codTerm: activeTerm.id,
                                  codMateria: materia.codMateria,
                                  nroSeccion: currentSection,
                                  profesorAsignado: null
                                })
                              }
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar Asignación
                          </button>
                        </div>
                      )}
                      
                      {assignedLab && materia.horasLab > 0 && (
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">Horas Laboratorio</span>
                          </div>
                          <p className="text-sm font-bold text-text-primary mb-0.5 line-clamp-1" title={assignedLab.nombre}>{assignedLab.nombre}</p>
                          <p className="text-xs text-text-muted mb-4">{assignedLab.cedula}</p>
                          <button
                            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition-colors cursor-pointer"
                            onClick={() => {
                              if (activeTerm) {
                                assignProfesorLab(activeTerm.id, materia.codMateria, currentSection, undefined)
                                void saveSeccionUseCase.execute({
                                  codTerm: activeTerm.id,
                                  codMateria: materia.codMateria,
                                  nroSeccion: currentSection,
                                  profesorAsignado: null
                                })
                              }
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar Asignación
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer className="px-6 py-4 border-t border-border bg-surface flex justify-end gap-3 z-10">
                <Button
                  variant="secondary"
                  className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-6 h-10 cursor-pointer border border-slate-200 shadow-sm"
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

