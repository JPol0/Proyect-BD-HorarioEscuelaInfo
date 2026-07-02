import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Alert, Select, ListBox } from '@heroui/react'
import type { Horario, ScheduleRow, DaysOfWeek } from '../../core/domain/Horario'
import { ObtenerHorario } from '../../core/application/useCases/Horarios/ObtenerHorario'
import { AutoAsignarMateria } from '../../core/application/useCases/Horarios/AutoAsignarMateria'
import { GuardarHorario } from '../../core/application/useCases/Horarios/GuardarHorario'
import { ApiHorarioRepository } from '../../core/infrastructure/adapters/ApiHorarioRepository'
import { HttpMateriaRepository } from '../../core/infrastructure/adapters/HttpMateriaRepository'
import { GetMaterias } from '../../core/application/useCases/Materias/GetMaterias'
import { useActiveTerm } from '../store/activeTermStore'
import { type Materia } from '../../core/domain/Materia'
import { calcularSemestreMaximo } from '../../core/domain/services/MateriaServices'
import Title from '../components/TitlePage'

const repository = new ApiHorarioRepository()
const materiaRepository = new HttpMateriaRepository()
const getWeeklyScheduleUseCase = new ObtenerHorario(repository)
const getMateriasUseCase = new GetMaterias(materiaRepository)
const autoAssignUseCase = new AutoAsignarMateria()
const saveWeeklyScheduleUseCase = new GuardarHorario(repository)

export default function HorariosPage () {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTerm } = useActiveTerm()

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
  // Usamos el id del term activo como punto de partida; cuando el backend real
  // esté conectado, este id se enviará directamente para consultar la BD.
  const [selectedTerm] = useState(activeTerm?.id ?? '')
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const [assignmentErrors, setAssignmentErrors] = useState<string[]>([])

  const semestreMaximo = materias.length > 0 ? calcularSemestreMaximo(materias) : 8;
  const opcionesSemestres = Array.from({ length: Math.max(1, semestreMaximo) }, (_, i) => i + 1);

  const convertirARomano = (num: number): string => {
    const valoresRomanos: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let resultado = '';
    let valorRestante = num;
    for (const key in valoresRomanos) {
      while (valorRestante >= valoresRomanos[key]) {
        resultado += key;
        valorRestante -= valoresRomanos[key];
      }
    }
    return resultado;
  }

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      setError(null)
      try {
        const [payload, materiasPayload] = await Promise.all([
          getWeeklyScheduleUseCase.execute(selectedTerm),
          getMateriasUseCase.execute()
        ])

        setMaterias(materiasPayload)

        const draftStr = sessionStorage.getItem(`draft_horario_${selectedTerm}`)
        let currentTuplas = draftStr ? JSON.parse(draftStr) as Horario[] : (payload ?? [])

        const materiaFromState = location.state?.materia as Materia | undefined
        const manualHours = location.state?.manualHours as Array<{ dia: DaysOfWeek, hora: string, cantidad: number }> | undefined

        if (materiaFromState != null && manualHours != null) {
          try {
            // Limpiamos las horas previas
            currentTuplas = currentTuplas.filter(
              (t) => !(t.codAsig === materiaFromState.codMateria && t.codTerm === selectedTerm)
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

                // Chequeamos si ya hay un horario reservado para ese día y hora en el mismo semestre
                const estaOcupado = currentTuplas.some(
                  t => t.semestre === materiaFromState.semestre && t.dia === block.dia && t.hora === horaAsignar
                )

                if (estaOcupado) {
                  throw new Error(`Choque de horarios: El ${block.dia} a las ${horaAsignar} ya está reservado en el semestre ${materiaFromState.semestre}.`)
                }

                nuevasTuplas.push({
                  codAsig: materiaFromState.codMateria,
                  codTerm: selectedTerm,
                  nroSeccion: 1, // Por defecto
                  dia: block.dia,
                  hora: horaAsignar,
                  semestre: materiaFromState.semestre,
                  codLaboratorio: materiaFromState.laboratorioId
                })
              }
            }

            currentTuplas = [...currentTuplas, ...nuevasTuplas]
            setSelectedSemester(materiaFromState.semestre)

            // Guardamos automáticamente en la base de datos para no perderlo
            await saveWeeklyScheduleUseCase.execute(selectedTerm, currentTuplas)
            sessionStorage.removeItem(`draft_horario_${selectedTerm}`)

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
      '19:00', '20:00', '21:00', '22:00'
    ]
    const days: DaysOfWeek[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

    return baseHours.map(hour => {
      const row: Partial<ScheduleRow> = { hour }
      for (const day of days) {
        const asig = tuplas.find(t => t.dia === day && t.hora === hour && t.semestre === selectedSemester)
        if (asig != null) {
          const materia = materias.find(m => m.codMateria === asig.codAsig)
          row[day] = materia ? materia.nombre : asig.codAsig
        } else {
          row[day] = '-'
        }
      }
      return row as ScheduleRow
    })
  }, [tuplas, selectedSemester, materias])

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

      {assignmentErrors.length > 0 && (
        <div className="flex flex-col gap-2 mb-6 w-full">
          {assignmentErrors.map((err, idx) => (
            <Alert key={idx} color="danger" title="Problema de Asignación">{err}</Alert>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-6 mb-7">
        <Title
          title="Horario Semanal"
          subtitle="Vista general del horario."
        />

        <div className="flex items-end gap-3 shrink-0">
          <div className="min-w-[150px]">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.2em] mb-2 block">
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
              className="w-full h-12"
            >
              <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-xl px-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors text-sm font-medium text-slate-700 h-12">
                <Select.Value />
                <Select.Indicator className="text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
                      className="px-4 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                    >
                      Semestre {convertirARomano(semestre)}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!activeTerm) {
                alert('Selecciona un Term primero.')
                return
              }
              let newTuplas = [...tuplas]
              const newErrors: string[] = []
              setAssignmentErrors([])

              // Validación: las materias comunes (esComun === true) DEL SEMESTRE ACTUAL
              // DEBEN estar asignadas manualmente antes de poder crear el horario automático.
              const materiasComunesSinAsignar = materias.filter(
                m => m.esComun && m.semestre === selectedSemester && !newTuplas.some(t => t.codAsig === m.codMateria)
              )

              if (materiasComunesSinAsignar.length > 0) {
                const nombres = materiasComunesSinAsignar.map(m => m.nombre).join(', ')
                alert(`Debes asignar manualmente el horario para las materias comunes del semestre ${selectedSemester} antes de autogenerar:\n\n${nombres}`)
                return
              }

              for (const materia of materias) {
                // Solo autoasignar las materias del semestre que estamos viendo actualmente
                if (materia.semestre !== selectedSemester) continue

                const isAssigned = newTuplas.some(t => t.codAsig === materia.codMateria)
                if (!isAssigned) {
                  try {
                    newTuplas = autoAssignUseCase.execute(materia, newTuplas, selectedTerm, materia.semestre || 1)
                  } catch (e) {
                    console.warn('No se pudo asignar completamente:', materia.nombre)
                    newErrors.push(e instanceof Error ? e.message : `No se pudo asignar ${materia.nombre}`)
                  }
                }
              }
              setTuplas(newTuplas)
              if (newErrors.length > 0) {
                setAssignmentErrors(newErrors)
              }
            }}
            className="flex items-center gap-2 h-12 px-5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-sans font-semibold shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Generar Horario
          </button>

          <button
            type="button"
            onClick={() => {
              const tieneAsignaciones = tuplas.some(t => t.semestre === selectedSemester)
              if (!tieneAsignaciones) {
                alert('No hay ningún horario asignado para eliminar en este semestre.')
                return
              }

              if (window.confirm(`¿Estás seguro de que deseas eliminar todas las asignaciones del semestre ${selectedSemester}?`)) {
                const remainingTuplas = tuplas.filter(t => t.semestre !== selectedSemester)
                setTuplas(remainingTuplas)
                void (async () => {
                  try {
                    await saveWeeklyScheduleUseCase.execute(selectedTerm, remainingTuplas)
                    sessionStorage.setItem(`draft_horario_${selectedTerm}`, JSON.stringify(remainingTuplas))
                  } catch (e) {
                    console.error('No se pudo borrar el JSON', e)
                  }
                })()
              }
            }}
            className="flex items-center gap-2 h-12 px-5 rounded-xl border border-slate-200 bg-white text-red-600 text-sm font-sans font-semibold shadow-sm transition-colors hover:bg-red-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Eliminar Horario
          </button>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                try {
                  await saveWeeklyScheduleUseCase.execute(selectedTerm, tuplas)
                  sessionStorage.removeItem(`draft_horario_${selectedTerm}`)
                  alert('Horario guardado correctamente')
                } catch (e) {
                  alert('Error al guardar: ' + (e instanceof Error ? e.message : ''))
                }
              })()
            }}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-button-primary text-white text-sm font-sans font-semibold shadow-sm transition-colors hover:bg-button-primary-hover"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 4h9l3 3v13H6V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 20v-6h8v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            Guardar
          </button>
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
                        {row.hour}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Lunes === '-' ? <span className="text-slate-300">—</span> : row.Lunes}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Martes === '-' ? <span className="text-slate-300">—</span> : row.Martes}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Miercoles === '-' ? <span className="text-slate-300">—</span> : row.Miercoles}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Jueves === '-' ? <span className="text-slate-300">—</span> : row.Jueves}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Viernes === '-' ? <span className="text-slate-300">—</span> : row.Viernes}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Sabado === '-' || !row.Sabado ? <span className="text-slate-300">—</span> : row.Sabado}
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-[#475569] font-medium border-l border-slate-100">
                        {row.Domingo === '-' || !row.Domingo ? <span className="text-slate-300">—</span> : row.Domingo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
      </div>
    </div>
  )
}
