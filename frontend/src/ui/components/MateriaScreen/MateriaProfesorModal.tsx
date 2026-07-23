import { useEffect, useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import { Magnifier } from '@gravity-ui/icons'
import type { Materia } from '../../../core/domain/Materia'
import type { Profesor } from '../../../core/domain/Profesor'
import type { Imparte } from '../../../core/domain/Imparte'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../../core/application/useCases/Profesores/GetProfesores'
import { HttpRImparteRepository } from '../../../core/infrastructure/adapters/HttpRImparteRepository'
import { GetRelacionesImparteByMateria } from '../../../core/application/useCases/relacionImparte/GetRelacionesImparteByMateria'
import { SaveRelacionImparte } from '../../../core/application/useCases/relacionImparte/SaveRelacionImparte'
import { DeleteRelacionImparte } from '../../../core/application/useCases/relacionImparte/DeleteRelacionImparte'
import { useActiveTerm } from '../../store/activeTermStore'

interface MateriaProfesorModalProps {
  materia: Materia
  currentSection: number
}

const profesorRepository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(profesorRepository)

const imparteRepository = new HttpRImparteRepository()
const getRelacionesUseCase = new GetRelacionesImparteByMateria(imparteRepository)
const saveRelacionUseCase = new SaveRelacionImparte(imparteRepository)
const deleteRelacionUseCase = new DeleteRelacionImparte(imparteRepository)

export function MateriaProfesorModal ({ materia, currentSection }: MateriaProfesorModalProps) {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [relaciones, setRelaciones] = useState<Imparte[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const { activeTerm } = useActiveTerm()

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError(null)
      const [listaP, listaR] = await Promise.all([
        getProfesoresUseCase.execute(),
        activeTerm ? getRelacionesUseCase.execute(activeTerm.id, materia.codMateria) : Promise.resolve([])
      ])
      setProfesores(listaP.filter((p) => p.status === 'A'))
      setRelaciones(listaR)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarDatos()
  }, [activeTerm, materia.codMateria])

  const profesoresFiltrados = profesores.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cedula.toLowerCase().includes(busqueda.toLowerCase())
  )

  const currentSectionRelations = relaciones.filter(r => r.nroSeccion === currentSection)

  const relationTeoria = currentSectionRelations.find(r => r.horasTeo > 0)
  const assignedTeoria = relationTeoria
    ? (profesores.find(p => p.cedula === relationTeoria.cedulaP) || {
        cedula: relationTeoria.cedulaP,
        nombre: `Profesor (${relationTeoria.cedulaP})`,
        correo: '',
        status: 'A'
      })
    : undefined

  const relationLab = currentSectionRelations.find(r => r.horasLab > 0)
  const assignedLab = relationLab
    ? (profesores.find(p => p.cedula === relationLab.cedulaP) || {
        cedula: relationLab.cedulaP,
        nombre: `Profesor (${relationLab.cedulaP})`,
        correo: '',
        status: 'A'
      })
    : undefined

  const hasAnyAssignment = !!assignedTeoria || (materia.horasLab > 0 && !!assignedLab)

  const refrescarRelaciones = async () => {
    if (!activeTerm) return
    try {
      const listR = await getRelacionesUseCase.execute(activeTerm.id, materia.codMateria)
      setRelaciones(listR)
    } catch (err) {
      console.error('Error al refrescar relaciones:', err)
    }
  }

  const handleAssignTeoria = async (profesor: Profesor) => {
    if (!activeTerm) return

    const prevRelaciones = [...relaciones]
    const existingIndex = relaciones.findIndex(r => r.cedulaP === profesor.cedula && r.nroSeccion === currentSection)
    const newRelaciones = [...relaciones]
    const imparteData: Imparte = {
      cedulaP: profesor.cedula,
      codAsig: materia.codMateria,
      nroSeccion: currentSection,
      horasTeo: materia.horasTeo,
      horasLab: existingIndex !== -1 ? relaciones[existingIndex].horasLab : 0,
      asignada: true
    }

    if (existingIndex !== -1) {
      newRelaciones[existingIndex] = imparteData
    } else {
      newRelaciones.push(imparteData)
    }

    setRelaciones(newRelaciones)

    try {
      setError(null)
      await saveRelacionUseCase.execute(imparteData, activeTerm.id)
      await refrescarRelaciones()
    } catch (err) {
      setRelaciones(prevRelaciones)
      setError(err instanceof Error ? err.message : 'Error al asignar teoría')
    }
  }

  const handleAssignLab = async (profesor: Profesor) => {
    if (!activeTerm) return

    const prevRelaciones = [...relaciones]
    const existingIndex = relaciones.findIndex(r => r.cedulaP === profesor.cedula && r.nroSeccion === currentSection)
    const newRelaciones = [...relaciones]
    const imparteData: Imparte = {
      cedulaP: profesor.cedula,
      codAsig: materia.codMateria,
      nroSeccion: currentSection,
      horasTeo: existingIndex !== -1 ? relaciones[existingIndex].horasTeo : 0,
      horasLab: materia.horasLab,
      asignada: true
    }

    if (existingIndex !== -1) {
      newRelaciones[existingIndex] = imparteData
    } else {
      newRelaciones.push(imparteData)
    }

    setRelaciones(newRelaciones)

    try {
      setError(null)
      await saveRelacionUseCase.execute(imparteData, activeTerm.id)
      await refrescarRelaciones()
    } catch (err) {
      setRelaciones(prevRelaciones)
      setError(err instanceof Error ? err.message : 'Error al asignar laboratorio')
    }
  }

  const handleRemoveTeoria = async () => {
    if (!activeTerm || !relationTeoria) return

    const prevRelaciones = [...relaciones]
    const cedulaP = relationTeoria.cedulaP

    const newRelaciones = [...relaciones]
    const existingIndex = relaciones.findIndex(r => r.cedulaP === cedulaP && r.nroSeccion === currentSection)
    if (existingIndex !== -1) {
      if (relaciones[existingIndex].horasLab > 0) {
        newRelaciones[existingIndex] = {
          ...relaciones[existingIndex],
          horasTeo: 0
        }
      } else {
        newRelaciones.splice(existingIndex, 1)
      }
    }
    setRelaciones(newRelaciones)

    try {
      setError(null)
      if (relationTeoria.horasLab > 0) {
        const updatedRelation: Imparte = {
          ...relationTeoria,
          horasTeo: 0
        }
        await saveRelacionUseCase.execute(updatedRelation, activeTerm.id)
      } else {
        await deleteRelacionUseCase.execute(cedulaP, materia.codMateria, activeTerm.id, currentSection)
      }

      await refrescarRelaciones()
    } catch (err) {
      setRelaciones(prevRelaciones)
      setError(err instanceof Error ? err.message : 'Error al eliminar la asignación de teoría')
    }
  }

  const handleRemoveLab = async () => {
    if (!activeTerm || !relationLab) return

    const prevRelaciones = [...relaciones]
    const cedulaP = relationLab.cedulaP

    const newRelaciones = [...relaciones]
    const existingIndex = relaciones.findIndex(r => r.cedulaP === cedulaP && r.nroSeccion === currentSection)
    if (existingIndex !== -1) {
      if (relaciones[existingIndex].horasTeo > 0) {
        newRelaciones[existingIndex] = {
          ...relaciones[existingIndex],
          horasLab: 0
        }
      } else {
        newRelaciones.splice(existingIndex, 1)
      }
    }
    setRelaciones(newRelaciones)

    try {
      setError(null)
      if (relationLab.horasTeo > 0) {
        const updatedRelation: Imparte = {
          ...relationLab,
          horasLab: 0
        }
        await saveRelacionUseCase.execute(updatedRelation, activeTerm.id)
      } else {
        await deleteRelacionUseCase.execute(cedulaP, materia.codMateria, activeTerm.id, currentSection)
      }

      await refrescarRelaciones()
    } catch (err) {
      setRelaciones(prevRelaciones)
      setError(err instanceof Error ? err.message : 'Error al eliminar la asignación de laboratorio')
    }
  }

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-[80]">
      <Modal.Container className="flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <Modal.Dialog className={`bg-surface rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl ${hasAnyAssignment ? 'md:max-w-4xl' : 'md:max-w-3xl'} transition-all duration-300 overflow-hidden border border-border flex flex-col max-h-[90vh]`}>
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-4 right-4 sm:top-5 sm:right-5 text-text-muted hover:text-text-secondary cursor-pointer z-10" />
              <Modal.Header className="px-4 sm:px-6 pt-5 pb-4 border-b border-border bg-surface-alt shrink-0">
                <Modal.Heading className="text-base sm:text-lg font-bold text-titlePage flex flex-col gap-0.5 pr-8">
                  Asignar Profesores
                  <span className="text-xs sm:text-sm font-normal text-subtitlePage truncate">{materia.nombre}</span>
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="p-0 flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
                {/* --- Columna Izquierda: Búsqueda y Selección --- */}
                <div className={`flex flex-col flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 ${hasAnyAssignment ? 'border-b md:border-b-0 md:border-r border-border' : ''}`}>
                  {error != null && (
                    <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-4 shrink-0">⚠️ {error}</p>
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
                            const isThisTeoriaAssigned = relationTeoria?.cedulaP === profesor.cedula
                            const isThisLabAssigned = relationLab?.cedulaP === profesor.cedula

                            return (
                              <div key={profesor.cedula} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${(isThisTeoriaAssigned || isThisLabAssigned) ? 'border-primary/40 bg-primary/5' : 'border-border bg-surface-alt hover:border-slate-300'}`}>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-text-primary truncate">{profesor.nombre}</p>
                                  <p className="text-xs text-text-muted">{profesor.cedula}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                                  {materia.horasTeo > 0 && (
                                    isThisTeoriaAssigned
                                      ? (
                                      <span className="text-xs font-semibold text-primary px-3 py-1.5 bg-primary/10 rounded-lg text-center">
                                        Teoría Asignada
                                      </span>
                                        )
                                      : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        isDisabled={!!relationTeoria}
                                        onPress={() => { void handleAssignTeoria(profesor) }}
                                        className="text-xs border-slate-200"
                                      >
                                        Asignar Teoría
                                      </Button>
                                        )
                                  )}

                                  {materia.horasLab > 0 && (
                                    isThisLabAssigned
                                      ? (
                                      <span className="text-xs font-semibold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg text-center">
                                        Laboratorio Asignado
                                      </span>
                                        )
                                      : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        isDisabled={!!relationLab}
                                        onPress={() => { void handleAssignLab(profesor) }}
                                        className="text-xs border-slate-200"
                                      >
                                        Asignar Laboratorio
                                      </Button>
                                        )
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        )}
                </div>

                {/* --- Columna Derecha: Profesores Asignados --- */}
                {hasAnyAssignment && (
                  <div className="w-full md:w-[300px] lg:w-[320px] bg-surface-alt p-4 sm:p-6 flex flex-col shrink-0 overflow-y-auto">
                    <h3 className="text-sm font-bold text-titlePage mb-4 sm:mb-5 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profesores Asignados
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                      {/* Columna Teoría */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded uppercase tracking-wider text-center">
                          Horas Teóricas
                        </span>
                        {assignedTeoria
                          ? (
                          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <p className="text-sm font-bold text-text-primary mb-0.5 line-clamp-1" title={assignedTeoria.nombre}>
                              {assignedTeoria.nombre}
                            </p>
                            <p className="text-xs text-text-muted mb-4">{assignedTeoria.cedula}</p>
                            <button
                              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition-colors cursor-pointer"
                              onClick={() => { void handleRemoveTeoria() }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Eliminar Asignación
                            </button>
                          </div>
                            )
                          : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-text-muted italic flex items-center justify-center min-h-[120px] md:min-h-[140px]">
                            Sin asignar
                          </div>
                            )}
                      </div>

                      {/* Columna Laboratorio */}
                      {materia.horasLab > 0 && (
                        <div className="flex flex-col gap-3">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded uppercase tracking-wider text-center">
                            Horas Laboratorio
                          </span>
                          {assignedLab
                            ? (
                            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                              <p className="text-sm font-bold text-text-primary mb-0.5 line-clamp-1" title={assignedLab.nombre}>
                                {assignedLab.nombre}
                              </p>
                              <p className="text-xs text-text-muted mb-4">{assignedLab.cedula}</p>
                              <button
                                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition-colors cursor-pointer"
                                onClick={() => { void handleRemoveLab() }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Eliminar Asignación
                              </button>
                            </div>
                              )
                            : (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-text-muted italic flex items-center justify-center min-h-[120px] md:min-h-[140px]">
                              Sin asignar
                            </div>
                              )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0 z-10">
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
