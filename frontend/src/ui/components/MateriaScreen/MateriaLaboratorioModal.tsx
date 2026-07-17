import { useEffect, useState } from 'react'
import { Modal, Button } from '@heroui/react'
import { Magnifier } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'
import { type Laboratorio } from '../../../core/domain/Laboratorio'
import { HttpLaboratorioRepository } from '../../../core/infrastructure/adapters/HttpLaboratorioRepository'
import { GetLaboratorios } from '../../../core/application/useCases/Laboratorios/GetLaboratorios'
import { useActiveTerm } from '../../store/activeTermStore'
import { HttpRSonEjercidosRepository } from '../../../core/infrastructure/adapters/HttpRSonEjercidosRepository'
import { GetRelacionesSonEjercidosByMateria } from '../../../core/application/useCases/relacionSonEjercidos/GetRelacionesSonEjercidosByMateria'
import { SaveRelacionSonEjercidos } from '../../../core/application/useCases/relacionSonEjercidos/SaveRelacionSonEjercidos'
import { DeleteRelacionSonEjercidos } from '../../../core/application/useCases/relacionSonEjercidos/DeleteRelacionSonEjercidos'

interface MateriaLaboratorioModalProps {
  materia: Materia
}

const repository = new HttpLaboratorioRepository()
const getLaboratoriosUseCase = new GetLaboratorios(repository)

const sonEjercidosRepository = new HttpRSonEjercidosRepository()
const getRelacionesUseCase = new GetRelacionesSonEjercidosByMateria(sonEjercidosRepository)
const saveUseCase = new SaveRelacionSonEjercidos(sonEjercidosRepository)
const deleteUseCase = new DeleteRelacionSonEjercidos(sonEjercidosRepository)

export function MateriaLaboratorioModal ({ materia }: MateriaLaboratorioModalProps) {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const { activeTerm } = useActiveTerm()

  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string>('ninguno')
  const [selectedSecundarioIds, setSelectedSecundarioIds] = useState<string[]>([])

  useEffect(() => {
    const cargarLaboratorios = async () => {
      try {
        setError(null)
        const lista = await getLaboratoriosUseCase.execute()
        setLaboratorios(lista)

        if (activeTerm) {
          const relaciones = await getRelacionesUseCase.execute(activeTerm.id, materia.codMateria)
          const principalRel = relaciones.find(r => r.prioridad === 1)
          const secundarioRels = relaciones.filter(r => r.prioridad === 2)

          setSelectedPrincipalId(principalRel ? String(principalRel.codLab) : 'ninguno')
          setSelectedSecundarioIds(secundarioRels.map(r => String(r.codLab)))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar laboratorios')
      } finally {
        setCargando(false)
      }
    }
    void cargarLaboratorios()
  }, [activeTerm, materia.codMateria])

  const handleGuardarPrincipal = async (valorId: string) => {
    if (activeTerm) {
      const isNinguno = valorId === 'ninguno'
      try {
        if (isNinguno) {
          if (selectedPrincipalId !== 'ninguno') {
            await deleteUseCase.execute(Number(selectedPrincipalId), materia.codMateria, activeTerm.id)
          }
          for (const secId of selectedSecundarioIds) {
            await deleteUseCase.execute(Number(secId), materia.codMateria, activeTerm.id)
          }
          setSelectedPrincipalId('ninguno')
          setSelectedSecundarioIds([])
        } else {
          const newPrincipalId = Number(valorId)
          if (selectedPrincipalId !== 'ninguno' && selectedPrincipalId !== valorId) {
            await deleteUseCase.execute(Number(selectedPrincipalId), materia.codMateria, activeTerm.id)
          }
          await saveUseCase.execute({
            codLab: newPrincipalId,
            codAsig: materia.codMateria,
            codTerm: activeTerm.id,
            prioridad: 1
          })
          setSelectedPrincipalId(valorId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar la asignación')
      }
    }
  }

  const handleAgregarSecundario = async (valorId: string) => {
    if (activeTerm) {
      if (valorId === 'ninguno') return
      try {
        const newSecundarioId = Number(valorId)
        await saveUseCase.execute({
          codLab: newSecundarioId,
          codAsig: materia.codMateria,
          codTerm: activeTerm.id,
          prioridad: 2
        })
        setSelectedSecundarioIds(prev => [...prev, valorId])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar la asignación')
      }
    }
  }

  const handleEliminarSecundario = async (valorId: string) => {
    if (activeTerm) {
      try {
        await deleteUseCase.execute(Number(valorId), materia.codMateria, activeTerm.id)
        setSelectedSecundarioIds(prev => prev.filter(id => id !== valorId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar la asignación')
      }
    }
  }

  const laboratoriosFiltrados = laboratorios.filter((lab) =>
    lab.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  const hasAnyAssignment = selectedPrincipalId !== 'ninguno' || selectedSecundarioIds.length > 0

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className={`bg-surface rounded-xl shadow-2xl w-full transition-all duration-300 overflow-hidden border border-border flex flex-col ${hasAnyAssignment ? 'max-w-4xl' : 'max-w-3xl'}`}>
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-text-muted hover:text-text-secondary cursor-pointer z-10" />

              {/* Encabezado */}
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-border bg-surface-alt">
                <Modal.Heading className="text-lg font-bold text-titlePage flex flex-col gap-0.5">
                  Asignar Laboratorios
                  <span className="text-sm font-normal text-subtitlePage">{materia.nombre}</span>
                </Modal.Heading>
              </Modal.Header>

              {/* Cuerpo del modal */}
              <Modal.Body className="p-0 flex flex-row max-h-[65vh]">
                {/* --- Columna Izquierda: Búsqueda y Selección --- */}
                <div className={`flex flex-col flex-1 p-6 overflow-y-auto ${hasAnyAssignment ? 'border-r border-border' : ''}`}>
                  {error != null && (
                    <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">⚠️ {error}</p>
                  )}

                  <div className="relative w-full flex items-center mb-4 shrink-0 font-sans">
                    <span className="absolute left-3 z-10 pointer-events-none flex items-center">
                      <Magnifier className="text-text-muted w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar laboratorio..."
                      value={busqueda}
                      onChange={(e) => { setBusqueda(e.target.value) }}
                      className="w-full pl-9 pr-3 text-sm h-10 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:border-slate-400 text-slate-700 placeholder-slate-400 transition-colors"
                    />
                  </div>

                  {cargando
                    ? <p className="text-xs text-text-muted italic animate-pulse">Cargando salas disponibles...</p>
                    : laboratoriosFiltrados.length === 0
                      ? <div className="text-sm text-text-muted">No se encontraron laboratorios activos con ese criterio.</div>
                      : (
                        <div className="space-y-2 pb-2">
                          {laboratoriosFiltrados.map((lab) => {
                            const isPrincipal = selectedPrincipalId === String(lab.id)
                            const isSecundario = selectedSecundarioIds.includes(String(lab.id))

                            return (
                              <div
                                key={lab.id}
                                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                  (isPrincipal || isSecundario)
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'border-border bg-surface-alt hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{lab.name}</p>
                                </div>

                                <div className="flex gap-2">
                                  {isPrincipal ? (
                                    <span className="text-xs font-semibold text-primary px-3 py-1.5 bg-primary/10 rounded-lg">
                                      Principal Asignado
                                    </span>
                                  ) : isSecundario ? (
                                    <span className="text-xs font-semibold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                      Secundario Asignado
                                    </span>
                                  ) : (
                                    <>
                                      {selectedPrincipalId === 'ninguno' ? (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onPress={() => { void handleGuardarPrincipal(String(lab.id)) }}
                                          className="text-xs border-slate-200"
                                        >
                                          Asignar Principal
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onPress={() => { void handleAgregarSecundario(String(lab.id)) }}
                                          className="text-xs border-slate-200"
                                        >
                                          Asignar Secundario
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                </div>

                {/* --- Columna Derecha: Laboratorios Asignados --- */}
                {hasAnyAssignment && (
                  <div className="w-[300px] bg-surface-alt p-6 flex flex-col shrink-0 overflow-y-auto">
                    <h3 className="text-sm font-bold text-titlePage mb-5 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                      </svg>
                      Laboratorios Asignados
                    </h3>

                    <div className="flex flex-col gap-4">
                      {/* Laboratorio Principal */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded uppercase tracking-wider text-center">
                          Laboratorio Principal
                        </span>
                        {selectedPrincipalId !== 'ninguno' ? (
                          (() => {
                            const principalLab = laboratorios.find(l => String(l.id) === selectedPrincipalId)
                            return (
                              <div className="bg-surface p-4 rounded-xl border border-border shadow-sm relative overflow-hidden group bg-white">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <p className="text-sm font-bold text-text-primary mb-0.5 line-clamp-1" title={principalLab?.name}>
                                  {principalLab?.name}
                                </p>
                                <p className="text-xs text-text-muted mb-4">Sala Principal</p>
                                <button
                                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition-colors cursor-pointer"
                                  onClick={() => { void handleGuardarPrincipal('ninguno') }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                  Eliminar Principal
                                </button>
                              </div>
                            )
                          })()
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-text-muted italic flex items-center justify-center min-h-[140px]">
                            Sin principal asignado
                          </div>
                        )}
                      </div>

                      {/* Laboratorios Secundarios */}
                      {selectedPrincipalId !== 'ninguno' && (
                        <div className="flex flex-col gap-3">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded uppercase tracking-wider text-center">
                            Laboratorios Secundarios
                          </span>
                          {selectedSecundarioIds.length > 0 ? (
                            <div className="flex flex-col gap-2 pr-1">
                              {selectedSecundarioIds.map(secId => {
                                const secLab = laboratorios.find(l => String(l.id) === secId)
                                return (
                                  <div key={secId} className="bg-surface p-4 rounded-xl border border-border shadow-sm relative overflow-hidden group bg-white">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <p className="text-sm font-bold text-text-primary mb-0.5 line-clamp-1" title={secLab?.name}>
                                      {secLab?.name}
                                    </p>
                                    <p className="text-xs text-text-muted mb-4">Sala Secundaria</p>
                                    <button
                                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition-colors cursor-pointer"
                                      onClick={() => { void handleEliminarSecundario(secId) }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                      Eliminar
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-text-muted italic flex items-center justify-center min-h-[140px]">
                              Sin secundarios asignados
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Modal.Body>

              {/* Botones de acción */}
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
