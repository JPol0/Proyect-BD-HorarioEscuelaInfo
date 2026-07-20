import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Alert, Select, ListBox, Modal, Button } from '@heroui/react'
import type { Horario, ScheduleRow, DaysOfWeek } from '../../core/domain/Horario'
import { ObtenerHorario } from '../../core/application/useCases/Horarios/ObtenerHorario'
import { GenerarHorarioSemestre } from '../../core/application/useCases/Horarios/GenerarHorarioSemestre'
import { GuardarHorario } from '../../core/application/useCases/Horarios/GuardarHorario'
import { ApiHorarioRepository } from '../../core/infrastructure/adapters/ApiHorarioRepository'
import { HttpMateriaRepository } from '../../core/infrastructure/adapters/HttpMateriaRepository'
import { HttpDisponibilidadRepository } from '../../core/infrastructure/adapters/HttpDisponibilidadRepository'
import { GetMaterias } from '../../core/application/useCases/Materias/GetMaterias'
import { useActiveTerm } from '../store/activeTermStore'
import { type Materia } from '../../core/domain/Materia'
import { calcularSemestreMaximo } from '../../core/domain/services/MateriaServices'
import Title from '../components/common/TitlePage'
import { DetalleHorarioModal } from '../components/MateriaScreen/DetalleHorarioModal'
import { type Imparte } from '../../core/domain/Imparte'
import { useUser } from '../store/userStore'
import { HttpRImparteRepository } from '../../core/infrastructure/adapters/HttpRImparteRepository'
import { GetRelacionesImparte } from '../../core/application/useCases/relacionImparte/GetRelacionesImparte'
import { HttpRSonEjercidosRepository } from '../../core/infrastructure/adapters/HttpRSonEjercidosRepository'
import { GetRelacionesSonEjercidos } from '../../core/application/useCases/relacionSonEjercidos/GetRelacionesSonEjercidos'
import { type Prerequito } from '../../core/domain/Prerequito'
import { HttpPrerequitoRepository } from '../../core/infrastructure/adapters/HttpPrerequitoRepository'
import { ObtenerPrerequitosPorTerm } from '../../core/application/useCases/Prerequito/ObtenerPrerequitosPorTerm'
import { HttpAlertRepository } from '../../core/infrastructure/adapters/HttpAlertRepository'

const repository = new ApiHorarioRepository()
const materiaRepository = new HttpMateriaRepository()
const disponibilidadRepository = new HttpDisponibilidadRepository()
const getWeeklyScheduleUseCase = new ObtenerHorario(repository)
const getMateriasUseCase = new GetMaterias(materiaRepository)
const generarHorarioUseCase = new GenerarHorarioSemestre(disponibilidadRepository)
const saveWeeklyScheduleUseCase = new GuardarHorario(repository)
const imparteRepository = new HttpRImparteRepository()
const getRelacionesImparteUseCase = new GetRelacionesImparte(imparteRepository)
const sonEjercidosRepository = new HttpRSonEjercidosRepository()
const getRelacionesSonEjercidosUseCase = new GetRelacionesSonEjercidos(sonEjercidosRepository)
const prerequitoRepository = new HttpPrerequitoRepository()
const getPrerequitosUseCase = new ObtenerPrerequitosPorTerm(prerequitoRepository)
const alertRepository = new HttpAlertRepository()

export default function HorariosPage () {
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTerm } = useActiveTerm()
  const [selectedTerm] = useState<string | null>(activeTerm?.id ?? null)
  const [laboratorioAssignments, setLaboratorioAssignments] = useState<Record<string, { principal: number, secundarios: number[] }>>({})

  const [relaciones, setRelaciones] = useState<Imparte[]>([])

  const { profesorAssignments, profesorLabAssignments } = useMemo(() => {
    const assignments: Record<string, Record<string, Record<number, string>>> = {}
    const assignmentsLab: Record<string, Record<string, Record<number, string>>> = {}
    const termId = selectedTerm || activeTerm?.id || 'default'

    relaciones.forEach((r) => {
      if (r.horasTeo > 0) {
        if (!assignments[termId]) assignments[termId] = {}
        if (!assignments[termId][r.codAsig]) assignments[termId][r.codAsig] = {}
        assignments[termId][r.codAsig][r.nroSeccion] = r.cedulaP
      }
      if (r.horasLab > 0) {
        if (!assignmentsLab[termId]) assignmentsLab[termId] = {}
        if (!assignmentsLab[termId][r.codAsig]) assignmentsLab[termId][r.codAsig] = {}
        assignmentsLab[termId][r.codAsig][r.nroSeccion] = r.cedulaP
      }
    })

    return { profesorAssignments: assignments, profesorLabAssignments: assignmentsLab }
  }, [relaciones, selectedTerm, activeTerm])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tuplas, setTuplasState] = useState<Horario[]>([])

  const setTuplas = (newTuplas: Horario[]) => {
    setTuplasState(newTuplas)
    if (selectedTerm) {
      sessionStorage.setItem(`draft_horario_${selectedTerm}`, JSON.stringify(newTuplas))
    }
  }
  const [materias, setMaterias] = useState<Materia[]>([])
  const [prerequitos, setPrerequitos] = useState<Prerequito[]>([])
  const [assignmentErrors, setAssignmentErrors] = useState<string[]>([])
  const [assignmentWarnings, setAssignmentWarnings] = useState<string[]>([])
  const [isConfirmGenerateOpen, setIsConfirmGenerateOpen] = useState(false)
  const [selectedBlockModal, setSelectedBlockModal] = useState<{
    dia: DaysOfWeek
    horaStr: string
    asigs: Array<{
      materia: Materia
      seccion: number
      cedulaProfesor?: string
      laboratorioId?: number
    }>
  } | null>(null)

  const semestreMaximo = materias.length > 0 ? calcularSemestreMaximo(materias) : 8
  const opcionesSemestres = Array.from({ length: Math.max(1, semestreMaximo) }, (_, i) => i + 1)
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

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

  const handleGenerarHorario = async (overwrite: boolean = false) => {
    if (!activeTerm) {
      alert('Selecciona un Term primero.')
      return
    }

    let newTuplas = [...tuplas]

    if (overwrite) {
      newTuplas = newTuplas.filter(t => {
        const mat = materias.find(m => m.codMateria === t.codAsig)
        const isCommon = mat ? mat.esComun : false
        return !(t.semestre === selectedSemester && !t.isManual && !isCommon)
      })
    }

    setAssignmentErrors([])
    setAssignmentWarnings([])
    setLoading(true)

    try {
      const response = await generarHorarioUseCase.execute({
        materias,
        prerequitos,
        horarioActual: newTuplas,
        termId: activeTerm.id,
        selectedSemester,
        profesorAssignments: profesorAssignments[activeTerm.id] || {},
        profesorLabAssignments: profesorLabAssignments?.[activeTerm.id] || {},
        laboratorioAssignments
      })

      setTuplas(response.horarioActualizado)

      if (response.errores.length > 0) {
        setAssignmentErrors(response.errores)

        // Guardar los errores asincrónicamente en la BD como alertas
        Promise.all(response.errores.map(async err =>
          await alertRepository.save(activeTerm.id, {
            id: null,
            titulo: err,
            estado: 'PENDIENTE',
            fecha: null
          })
        )).catch(console.error)
      }
      if (response.advertencias.length > 0) {
        setAssignmentWarnings(response.advertencias)

        // Guardar las advertencias asincrónicamente en la BD
        Promise.all(response.advertencias.map(async warn =>
          await alertRepository.save(activeTerm.id, {
            id: null,
            titulo: warn,
            estado: 'PENDIENTE',
            fecha: null
          })
        )).catch(console.error)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ocurrió un error al generar el horario.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadSchedule = async () => {
      if (selectedTerm === null) {
        setLoading(false)
        return
      }
      const term = selectedTerm
      setLoading(true)
      setError(null)
      try {
        const [payload, materiasPayload, relacionesPayload, sonEjercidosPayload, prerequitosPayload] = await Promise.all([
          getWeeklyScheduleUseCase.execute(term),
          getMateriasUseCase.execute(term),
          getRelacionesImparteUseCase.execute(term),
          getRelacionesSonEjercidosUseCase.execute(term),
          getPrerequitosUseCase.execute(term)
        ])

        setMaterias(materiasPayload)
        setRelaciones(relacionesPayload)
        setPrerequitos(prerequitosPayload)

        const mappedLabs: Record<string, { principal: number, secundarios: number[] }> = {}
        sonEjercidosPayload.forEach((r) => {
          if (!mappedLabs[r.codAsig]) {
            mappedLabs[r.codAsig] = { principal: 0, secundarios: [] }
          }
          if (r.prioridad === 1) {
            mappedLabs[r.codAsig].principal = r.codLab
          } else if (r.prioridad === 2) {
            mappedLabs[r.codAsig].secundarios.push(r.codLab)
          }
        })
        setLaboratorioAssignments(mappedLabs)

        const draftStr = sessionStorage.getItem(`draft_horario_${term}`)
        let currentTuplas = draftStr ? JSON.parse(draftStr) as Horario[] : (payload ?? [])

        const materiaFromState = location.state?.materia as Materia | undefined
        const manualHours = location.state?.manualHours as Array<{ nroSeccion: number, dia: DaysOfWeek, hora: string, cantidad: number }> | undefined

        if (materiaFromState != null && manualHours != null) {
          try {
            // Sabemos qué sección estamos asignando porque ahora el modal manda solo esa sección
            const secToOverwrite = manualHours.length > 0 ? manualHours[0].nroSeccion : 1

            // Limpiamos las horas previas SOLO para esa sección
            currentTuplas = currentTuplas.filter(
              (t) => !(t.codAsig === materiaFromState.codMateria && t.nroSeccion === secToOverwrite)
            )

            const horasDisponiblesBase = [
              '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
              '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
              '19:00', '20:00', '21:00', '22:00'
            ]

            const nuevasTuplas: Horario[] = []
            for (const block of manualHours) {
              const startIndex = horasDisponiblesBase.indexOf(block.hora)
              if (startIndex === -1) continue

              for (let i = 0; i < block.cantidad; i++) {
                if (startIndex + i >= horasDisponiblesBase.length) break
                const horaAsignar = horasDisponiblesBase[startIndex + i]

                // Chequeamos si ya hay un horario reservado para ese día y hora en la MISMA sección
                const estaOcupado = currentTuplas.some(
                  t => t.semestre === materiaFromState.semestre && t.dia === block.dia && t.hora === horaAsignar && t.nroSeccion === block.nroSeccion
                )

                if (estaOcupado) {
                  throw new Error(`Choque de horarios: El ${block.dia} a las ${horaAsignar} ya está reservado para la Sección ${block.nroSeccion}.`)
                }

                const labObj = laboratorioAssignments[materiaFromState.codMateria]
                let labIdAsignar: number | undefined

                if (labObj?.principal) {
                  const choquePrincipal = currentTuplas.some(t =>
                    t.dia === block.dia &&
                    t.hora === horaAsignar &&
                    t.laboratorio?.id === labObj.principal
                  )

                  if (!choquePrincipal) {
                    labIdAsignar = labObj.principal
                  } else if (labObj.secundarios && labObj.secundarios.length > 0) {
                    for (const secId of labObj.secundarios) {
                      const choqueSecundario = currentTuplas.some(t =>
                        t.dia === block.dia &&
                        t.hora === horaAsignar &&
                        t.laboratorio?.id === secId
                      )
                      if (!choqueSecundario) {
                        labIdAsignar = secId
                        break
                      }
                    }
                    if (!labIdAsignar) {
                      throw new Error(`Choque de laboratorios: El principal y todos los laboratorios secundarios asignados están ocupados el ${block.dia} a las ${horaAsignar}.`)
                    }
                  } else {
                    throw new Error(`Choque de laboratorios: El laboratorio principal está ocupado el ${block.dia} a las ${horaAsignar} y no hay secundarios asignados.`)
                  }
                }

                nuevasTuplas.push({
                  codAsig: materiaFromState.codMateria,
                  nroSeccion: block.nroSeccion,
                  dia: block.dia,
                  hora: horaAsignar,
                  semestre: materiaFromState.semestre,
                  laboratorio: labIdAsignar !== undefined ? { id: labIdAsignar, name: 'Laboratorio' } : null,
                  isManual: true
                })
              }
            }

            currentTuplas = [...currentTuplas, ...nuevasTuplas]
            setSelectedSemester(materiaFromState.semestre)

            // Guardamos automáticamente en la base de datos para no perderlo
            await saveWeeklyScheduleUseCase.execute(term, currentTuplas)
            sessionStorage.removeItem(`draft_horario_${term}`)

            // Limpiamos el state para que si recarga no se vuelva a autogenerar
            window.history.replaceState({}, document.title)
          } catch (e) {
            setAssignmentErrors([e instanceof Error ? e.message : 'Error al asignar y guardar'])
            // Si hubo error de choque, no agregamos las nuevas tuplas, se mantiene currentTuplas intacto
          }
        }
        setTuplas(currentTuplas)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor.')
      } finally {
        setLoading(false)
      }
    }

    void loadSchedule()
  }, [selectedTerm])

  const scheduleRows = useMemo(() => {
    const baseHours = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00'
    ]
    const days: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

    return baseHours.map(hour => {
      const row: Partial<ScheduleRow> = { hour }
      for (const day of days) {
        const asigs = tuplas.filter(t => t.dia === day && t.hora === hour && t.semestre === selectedSemester)
        if (asigs.length > 0) {
          // Agrupamos por materia para combinar las secciones
          const agrupadoPorMateria: Record<string, number[]> = {}
          for (const asig of asigs) {
            if (!agrupadoPorMateria[asig.codAsig]) agrupadoPorMateria[asig.codAsig] = []
            agrupadoPorMateria[asig.codAsig].push(asig.nroSeccion || 1)
          }

          const textos = Object.entries(agrupadoPorMateria).map(([codAsig, sections]) => {
            const materia = materias.find(m => m.codMateria === codAsig)
            if (materia) {
              const hasLab = asigs.some(a => a.codAsig === codAsig && a.laboratorio)
              const uniqueSections = Array.from(new Set(sections))
              const romans = uniqueSections.sort((a, b) => a - b).map(s => convertirARomano(s)).join('/')
              let resultStr = `${materia.nombre} (Sección ${romans})`
              if (hasLab) {
                resultStr += ' LAB'
              }
              return resultStr
            }
            return codAsig
          })
          row[day] = textos.join(' | ')
        } else {
          row[day] = '-'
        }
      }
      return row as ScheduleRow
    })
  }, [tuplas, selectedSemester, materias])

  const handleCellClick = (day: DaysOfWeek, hour: string) => {
    const asigs = tuplas.filter(t => t.dia === day && t.hora === hour && t.semestre === selectedSemester)
    if (asigs.length === 0) return

    const h = parseInt(hour.split(':')[0], 10)

    const mappedAsigs = asigs.map(asig => {
      const materia = materias.find(m => m.codMateria === asig.codAsig)
      if (!materia) return null

      const hasLab = !!asig.laboratorio || !!(asig as any).codLaboratorio
      const cedulaProfesor = (hasLab
        ? profesorLabAssignments?.[selectedTerm!]?.[asig.codAsig]?.[asig.nroSeccion]
        : undefined) ||
        profesorAssignments[selectedTerm!]?.[asig.codAsig]?.[asig.nroSeccion] ||
        profesorLabAssignments?.[selectedTerm!]?.[asig.codAsig]?.[asig.nroSeccion]

      return {
        materia,
        seccion: asig.nroSeccion,
        cedulaProfesor,
        laboratorioId: asig.laboratorio?.id
      }
    }).filter(Boolean) as any[]

    if (mappedAsigs.length === 0) return

    setSelectedBlockModal({
      dia: day,
      horaStr: `${h}:00 - ${h}:50`,
      asigs: mappedAsigs
    })
  }

  return (
    <div className="px-10 py-9 max-w-[1200px]">
      {/* Banner: si no hay term activo, pedimos que seleccione uno */}
      {activeTerm === null && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 font-hanken">No hay ningún Term seleccionado</p>
            <p className="text-xs text-amber-700 font-hanken mt-0.5">
              Ve a{' '}
              <button
                className="underline font-semibold"
                onClick={() => { void navigate('/terms') }}
              >
                Seleccionar Term
              </button>
              {' '}para establecer el periodo académico de trabajo.
            </p>
          </div>
        </div>
      )}

      {(assignmentErrors.length > 0 || assignmentWarnings.length > 0) && (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 max-w-sm w-full" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          {assignmentErrors.map((err, idx) => (
            <div key={`err-${idx}`} className="relative shadow-lg rounded-xl">
              <Alert color="danger" title="Problema de Asignación">
                <div className="pr-8 text-sm leading-relaxed">{err}</div>
              </Alert>
              <button 
                className="absolute top-3 right-3 text-red-700 hover:text-red-900 hover:bg-red-100 rounded-lg p-1.5 cursor-pointer z-10 transition-colors" 
                onClick={() => setAssignmentErrors((prev) => prev.filter((_, i) => i !== idx))}
                aria-label="Cerrar alerta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          ))}
          {assignmentWarnings.map((warn, idx) => (
            <div key={`warn-${idx}`} className="relative shadow-lg rounded-xl">
              <Alert color="warning" title="Advertencia">
                <div className="pr-8 text-sm leading-relaxed">{warn}</div>
              </Alert>
              <button 
                className="absolute top-3 right-3 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 rounded-lg p-1.5 cursor-pointer z-10 transition-colors" 
                onClick={() => setAssignmentWarnings((prev) => prev.filter((_, i) => i !== idx))}
                aria-label="Cerrar alerta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-7">
        {/* Contenedor Izquierdo: Título y Selector de Semestre */}
        <div className="flex flex-col gap-4">
          <Title
            title="Horario Semanal"
            subtitle="Vista general del horario."
          />

          {/* Selector de Semestre */}
          <div className="w-full sm:w-[150px]">
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.2em] mb-1.5 block text-left">
              Semestre
            </label>
            <Select
              aria-label="Filtrar por semestre"
              placeholder="Seleccionar semestre"
              variant="primary"
              value={String(selectedSemester)}
              onChange={(valor) => {
                if (valor) setSelectedSemester(Number(valor))
              }}
              className="w-full h-9"
            >
              <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors text-xs font-medium text-slate-700 h-9">
                <Select.Value />
                <Select.Indicator className="text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Select.Indicator>
              </Select.Trigger>

              <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-[150px] z-50">
                <ListBox>
                  {opcionesSemestres.map((semestre) => (
                    <ListBox.Item
                      key={semestre.toString()}
                      id={semestre.toString()}
                      textValue={`Semestre ${convertirARomano(semestre)}`}
                      className="px-4 py-2 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                    >
                      Semestre {convertirARomano(semestre)}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>

        {/* Contenedor Derecho: Botones de Acción */}
        <div className="flex items-center shrink-0 w-full md:w-auto mt-2 md:mt-0">
          {!isLector && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const hasAutoBlocks = tuplas.some(t => t.semestre === selectedSemester && !t.isManual)
                  if (hasAutoBlocks) {
                    setIsConfirmGenerateOpen(true)
                  } else {
                    void handleGenerarHorario(false)
                  }
                }}
                className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-sans font-semibold shadow-sm transition-colors hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generar Horario
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedTerm === null) return
                  const term = selectedTerm
                  const tieneAsignacionesAuto = tuplas.some(t => t.semestre === selectedSemester && !t.isManual)
                  if (!tieneAsignacionesAuto) {
                    alert('No hay ningún horario generado automáticamente para eliminar en este semestre.')
                    return
                  }

                  if (window.confirm(`¿Estás seguro de que deseas eliminar las asignaciones generadas automáticamente del semestre ${selectedSemester}? Los horarios manuales y profesores asignados se mantendrán intactos.`)) {
                  const remainingTuplas = tuplas.filter(t => {
                    const mat = materias.find(m => m.codMateria === t.codAsig)
                    const isCommon = mat ? mat.esComun : false
                    return !(t.semestre === selectedSemester && !t.isManual && !isCommon)
                  })
                    setTuplas(remainingTuplas)
                    void (async () => {
                      try {
                        await saveWeeklyScheduleUseCase.execute(term, remainingTuplas)
                        sessionStorage.setItem(`draft_horario_${term}`, JSON.stringify(remainingTuplas))
                      } catch (e) {
                        console.error('No se pudo borrar el JSON', e)
                      }
                    })()
                  }
                }}
                className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-red-600 text-xs font-sans font-semibold shadow-sm transition-colors hover:bg-red-50 cursor-pointer whitespace-nowrap"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Eliminar Horario
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedTerm === null) return
                  const term = selectedTerm
                  void (async () => {
                    try {
                      await saveWeeklyScheduleUseCase.execute(term, tuplas)
                      sessionStorage.removeItem(`draft_horario_${term}`)
                      alert('Horario guardado correctamente')
                    } catch (e) {
                      alert('Error al guardar: ' + (e instanceof Error ? e.message : ''))
                    }
                  })()
                }}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-button-primary text-white text-xs font-sans font-semibold shadow-sm transition-colors hover:bg-button-primary-hover cursor-pointer whitespace-nowrap"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M6 4h9l3 3v13H6V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M8 20v-6h8v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M8 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      {error != null && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading
          ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
            </div>
            )
          : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-white border-b border-slate-200">
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Hora</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Lunes</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Martes</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Miércoles</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Jueves</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Viernes</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Sábado</th>
                    <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Domingo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scheduleRows.map((row) => (
                    <tr
                      key={row.hour}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 text-[12px] font-bold text-[#14233f] whitespace-nowrap bg-slate-50 text-center">
                        {parseInt(row.hour.split(':')[0], 10)}:00 - {parseInt(row.hour.split(':')[0], 10)}:50
                      </td>
                      {['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map((dayStr) => {
                        const day = dayStr as DaysOfWeek
                        const content = row[day]
                        const isEmpty = content === '-' || !content

                        return (
                          <td
                            key={day}
                            className={`px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100 ${!isEmpty ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                            onClick={() => !isEmpty && handleCellClick(day, row.hour)}
                          >
                            {isEmpty ? <span className="text-slate-300">—</span> : content}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
      </div>

      {isConfirmGenerateOpen && (
        <Modal isOpen={isConfirmGenerateOpen} onOpenChange={setIsConfirmGenerateOpen}>
          <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
            <Modal.Container className="flex items-center justify-center p-4">
              <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100 p-6 text-center">
                <Modal.Heading className="text-lg font-bold text-slate-800 mb-3">
                  Confirmación de Generación
                </Modal.Heading>
                <Modal.Body className="text-sm text-slate-600 mb-6">
                  Al hacer clic en generar horario se van a sobreescribir los bloques previamente asignados. Solo se eliminarán y reasignarán los horarios generados automáticamente. Los horarios manuales se mantendrán. <strong>¿Desea continuar?</strong>
                </Modal.Body>
                <Modal.Footer className="flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-5 h-9 cursor-pointer border border-slate-200"
                    onPress={() => { setIsConfirmGenerateOpen(false) }}
                  >
                    No
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-button-primary hover:bg-button-primary-hover text-white font-medium text-xs px-5 h-9 cursor-pointer"
                    onPress={() => {
                      setIsConfirmGenerateOpen(false)
                      void handleGenerarHorario(true)
                    }}
                  >
                    Sí
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}
      {selectedBlockModal && (
        <DetalleHorarioModal
          isOpen={true}
          onClose={() => setSelectedBlockModal(null)}
          dia={selectedBlockModal.dia}
          horaStr={selectedBlockModal.horaStr}
          asigs={selectedBlockModal.asigs}
        />
      )}
    </div>
  )
}
