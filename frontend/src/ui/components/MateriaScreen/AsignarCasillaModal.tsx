import { useState, useEffect, useMemo } from 'react'
import { Modal, Button } from '@heroui/react'
import { Plus, Clock, CircleExclamationFill } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'
import { type DaysOfWeek, type Horario } from '../../../core/domain/Horario'
import { type Prerequito } from '../../../core/domain/Prerequito'
import { type Profesor } from '../../../core/domain/Profesor'
import { type Laboratorio } from '../../../core/domain/Laboratorio'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../../core/application/useCases/Profesores/GetProfesores'
import { HttpLaboratorioRepository } from '../../../core/infrastructure/adapters/HttpLaboratorioRepository'
import { GetLaboratorios } from '../../../core/application/useCases/Laboratorios/GetLaboratorios'
import { HttpDisponibilidadRepository } from '../../../core/infrastructure/adapters/HttpDisponibilidadRepository'
import { ValidarAsignacionCasilla } from '../../../core/application/useCases/Horarios/ValidarAsignacionCasilla'
import { convertirARomano } from '../../../core/application/useCases/Horarios/AlgoritmoGeneracion/ValidarAsignacionesPrevias'

const profesorRepository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(profesorRepository)

const laboratorioRepository = new HttpLaboratorioRepository()
const getLaboratoriosUseCase = new GetLaboratorios(laboratorioRepository)

const disponibilidadRepository = new HttpDisponibilidadRepository()
const validarAsignacionUseCase = new ValidarAsignacionCasilla(disponibilidadRepository)

export interface AsignarCasillaModalProps {
  isOpen: boolean
  onClose: () => void
  dia: DaysOfWeek
  hora: string // Ej: '07:00'
  selectedSemester: number
  selectedTerm: string
  materias: Materia[]
  tuplas: Horario[]
  prerequitos: Prerequito[]
  profesorAssignments: Record<string, Record<number, string>>
  profesorLabAssignments?: Record<string, Record<number, string>>
  laboratorioAssignments: Record<string, { principal: number, secundarios: number[] }>
  onAsignar: (nuevaTupla: Horario) => void
}

export function AsignarCasillaModal ({
  isOpen,
  onClose,
  dia,
  hora,
  selectedSemester,
  selectedTerm,
  materias,
  tuplas,
  prerequitos,
  profesorAssignments,
  profesorLabAssignments,
  laboratorioAssignments,
  onAsignar
}: AsignarCasillaModalProps) {
  const materiasDelSemestre = useMemo(() => {
    return materias.filter(m => m.semestre === selectedSemester)
  }, [materias, selectedSemester])

  const [selectedCodMateria, setSelectedCodMateria] = useState<string>('')
  const [selectedSeccion, setSelectedSeccion] = useState<number>(1)
  const [tipoBloque, setTipoBloque] = useState<'Teoría/Práctica' | 'Laboratorio'>('Teoría/Práctica')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])

  useEffect(() => {
    if (!isOpen) {
      setValidationError(null)
      return
    }

    // Inicializar materia seleccionada
    if (materiasDelSemestre.length > 0) {
      const defaultMateria = materiasDelSemestre[0]
      setSelectedCodMateria(defaultMateria.codMateria)
      setSelectedSeccion(1)

      if (defaultMateria.horasLab > 0 && defaultMateria.horasTeo === 0 && defaultMateria.horasPrac === 0) {
        setTipoBloque('Laboratorio')
      } else {
        setTipoBloque('Teoría/Práctica')
      }
    }

    const loadMetadata = async () => {
      try {
        const [profs, labs] = await Promise.all([
          getProfesoresUseCase.execute(),
          getLaboratoriosUseCase.execute()
        ])
        setProfesores(profs)
        setLaboratorios(labs)
      } catch (e) {
        console.error('Error cargando profesores o laboratorios:', e)
      }
    }
    void loadMetadata()
  }, [isOpen, materiasDelSemestre])

  const materiaActual = useMemo(() => {
    return materiasDelSemestre.find(m => m.codMateria === selectedCodMateria)
  }, [materiasDelSemestre, selectedCodMateria])

  // Ajustar tipo de bloque si la materia solo tiene uno
  useEffect(() => {
    if (!materiaActual) return
    const tieneTeoria = materiaActual.horasTeo > 0 || materiaActual.horasPrac > 0
    const tieneLab = materiaActual.horasLab > 0

    if (tieneLab && !tieneTeoria) {
      setTipoBloque('Laboratorio')
    } else if (tieneTeoria && !tieneLab) {
      setTipoBloque('Teoría/Práctica')
    }
    setValidationError(null)
  }, [materiaActual])

  if (!isOpen) return null

  const nroSecciones = Math.max(1, materiaActual?.nroSecciones || 1)
  const seccionesDisponibles = Array.from({ length: nroSecciones }, (_, i) => i + 1)

  // Cómputo de avance de horas para la materia y sección seleccionada
  const horasTotalesTipo = materiaActual
    ? (tipoBloque === 'Laboratorio' ? materiaActual.horasLab : (materiaActual.horasTeo + materiaActual.horasPrac))
    : 0

  const horasAsignadasTipo = materiaActual
    ? tuplas.filter(t =>
      t.codAsig === materiaActual.codMateria &&
      t.nroSeccion === selectedSeccion &&
      (tipoBloque === 'Laboratorio' ? (t.laboratorio !== null && t.laboratorio !== undefined) : (!t.laboratorio))
    ).length
    : 0

  // Profesor asignado
  const cedulaProfesor = materiaActual
    ? (tipoBloque === 'Laboratorio'
        ? profesorLabAssignments?.[materiaActual.codMateria]?.[selectedSeccion]
        : profesorAssignments[materiaActual.codMateria]?.[selectedSeccion])
    : undefined

  const profesorNombre = profesores.find(p => p.cedula === cedulaProfesor)?.nombre || cedulaProfesor

  // Laboratorio asignado
  const labId = materiaActual ? laboratorioAssignments[materiaActual.codMateria]?.principal : undefined
  const laboratorioNombre = laboratorios.find(l => l.id === labId)?.name || (labId ? `Laboratorio #${labId}` : undefined)

  const horaNum = parseInt(hora.split(':')[0], 10)
  const horaFin = horaNum < 10 ? `0${horaNum}:50` : `${horaNum}:50`

  const handleConfirmar = async () => {
    if (!materiaActual) return

    setIsValidating(true)
    setValidationError(null)

    try {
      const res = await validarAsignacionUseCase.execute({
        dia,
        hora,
        materia: materiaActual,
        nroSeccion: selectedSeccion,
        tipo: tipoBloque,
        laboratorioId: tipoBloque === 'Laboratorio' ? labId : undefined,
        tuplas,
        selectedTerm,
        materias,
        prerequitos,
        profesorAssignments,
        profesorLabAssignments,
        laboratorioAssignments
      })

      if (!res.esValido) {
        setValidationError(res.mensajeError || 'No es posible asignar esta materia a la casilla por restricciones de horario.')
        setIsValidating(false)
        return
      }

      const nuevaTupla: Horario = {
        codAsig: materiaActual.codMateria,
        codTerm: selectedTerm,
        nroSeccion: selectedSeccion,
        dia,
        hora,
        semestre: materiaActual.semestre,
        isManual: true,
        laboratorio: tipoBloque === 'Laboratorio' && res.labIdAsignado ? { id: res.labIdAsignado, name: laboratorioNombre || '' } : null,
        cedulaP: res.cedulaProfesor || ''
      }

      onAsignar(nuevaTupla)
      onClose()
    } catch (e) {
      setValidationError(e instanceof Error ? e.message : 'Error inesperado al validar la asignación.')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden font-sans border border-slate-100 max-h-[90vh] flex flex-col">
            <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

            {/* Header */}
            <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center justify-between">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  Asignar Materia a Casilla
                </Modal.Heading>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                  Semestre {convertirARomano(selectedSemester)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{dia} &bull; {hora} - {horaFin}</span>
              </div>
            </Modal.Header>

            {/* Body */}
            <Modal.Body className="px-6 py-5 overflow-y-auto bg-white flex flex-col gap-4">
              {/* Alerta de Error de Validación */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CircleExclamationFill className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    {validationError}
                  </div>
                </div>
              )}

              {/* Selector de Asignatura */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Asignatura del Semestre
                </label>
                <div className="relative">
                  <select
                    value={selectedCodMateria}
                    onChange={(e) => {
                      setSelectedCodMateria(e.target.value)
                      setSelectedSeccion(1)
                      setValidationError(null)
                    }}
                    className="w-full appearance-none border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white focus:border-slate-400 focus:outline-none transition-all text-xs font-medium text-slate-800 shadow-sm cursor-pointer"
                  >
                    {materiasDelSemestre.map((m) => (
                      <option key={m.codMateria} value={m.codMateria}>
                        {m.nombre} ({m.codMateria}) - {m.horasTeo + m.horasPrac + m.horasLab}h sem.
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sección y Tipo de Bloque en 2 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Selector de Sección */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Sección
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSeccion}
                      onChange={(e) => {
                        setSelectedSeccion(Number(e.target.value))
                        setValidationError(null)
                      }}
                      className="w-full appearance-none border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white focus:border-slate-400 focus:outline-none transition-all text-xs font-medium text-slate-800 shadow-sm cursor-pointer"
                    >
                      {seccionesDisponibles.map((sec) => (
                        <option key={sec} value={sec}>
                          Sección {convertirARomano(sec)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Tipo de Bloque */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Tipo de Bloque
                  </label>
                  <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      type="button"
                      disabled={materiaActual ? (materiaActual.horasTeo === 0 && materiaActual.horasPrac === 0) : false}
                      onClick={() => {
                        setTipoBloque('Teoría/Práctica')
                        setValidationError(null)
                      }}
                      className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all text-center ${tipoBloque === 'Teoría/Práctica' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500'}`}
                    >
                      Teoría
                    </button>
                    <button
                      type="button"
                      disabled={materiaActual ? materiaActual.horasLab === 0 : false}
                      onClick={() => {
                        setTipoBloque('Laboratorio')
                        setValidationError(null)
                      }}
                      className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all text-center ${tipoBloque === 'Laboratorio' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500'}`}
                    >
                      Laboratorio
                    </button>
                  </div>
                </div>
              </div>

              {/* Ficha de Detalles Informativos (Profesor, Lab, Horas) */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col gap-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Profesor asignado:</span>
                  <span className={`font-bold ${profesorNombre ? 'text-slate-800' : 'text-amber-600'}`}>
                    {profesorNombre || 'No asignado'}
                  </span>
                </div>

                {tipoBloque === 'Laboratorio' && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Laboratorio asignado:</span>
                    <span className={`font-bold ${laboratorioNombre ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {laboratorioNombre || 'No asignado'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-600">Avance de horas ({tipoBloque}):</span>
                  <span className="font-bold text-slate-800">
                    {horasAsignadasTipo} / {horasTotalesTipo} horas asignadas
                  </span>
                </div>
              </div>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5 shrink-0">
              <Button
                variant="secondary"
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-4 h-9 cursor-pointer border border-slate-200 rounded-xl"
                onPress={onClose}
              >
                Cancelar
              </Button>
              <Button
                className="bg-button-primary hover:bg-button-primary-hover text-white font-medium text-xs px-5 h-9 cursor-pointer shadow-sm rounded-xl flex items-center gap-1.5 transition-colors"
                onPress={() => { void handleConfirmar() }}
                isDisabled={isValidating || !materiaActual}
              >
                <Plus className="w-3.5 h-3.5" />
                {isValidating ? 'Validando...' : 'Asignar a Casilla'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
