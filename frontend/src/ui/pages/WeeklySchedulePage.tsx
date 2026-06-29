import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WeeklySchedule } from '../../core/domain/WeeklySchedule'
import { GetWeeklySchedule } from '../../core/application/useCases/useCasesWeeklySchedule/GetWeeklySchedule'
import { ApiWeeklyScheduleRepository } from '../../core/infrastructure/adapters/ApiWeeklyScheduleRepository'
import { useActiveTerm } from '../contexts/ActiveTermContext'

const repository = new ApiWeeklyScheduleRepository()
const getWeeklyScheduleUseCase = new GetWeeklySchedule(repository)

export default function WeeklySchedulePage () {
  const navigate = useNavigate()
  const { activeTerm } = useActiveTerm()

  const [data, setData] = useState<WeeklySchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Usamos el id del term activo como punto de partida; cuando el backend real
  // esté conectado, este id se enviará directamente para consultar la BD.
  const [selectedTerm] = useState(activeTerm?.id ?? '')
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      setError(null)
      try {
        const payload = await getWeeklyScheduleUseCase.execute(selectedTerm)
        setData(payload)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor.')
      } finally {
        setLoading(false)
      }
    }

    void loadSchedule()
  }, [selectedTerm])

  const scheduleRows = data?.schedule ?? []

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

      <div className="flex items-start justify-between gap-6 mb-7">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2a6eea] block mb-6">
            {data ? `${data.semester} - ${data.term}` : 'Cargando...'}
          </span>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary mt-1">
            Horario Semanal
          </h1>
          <p className="text-text-secondary mt-1.5 text-sm max-w-[520px]">
            Vista tabular del horario academico. Filas por hora, columnas por dia. Las celdas vacias se muestran con guion.
          </p>
        </div>

        <div className="flex items-end gap-3 shrink-0">
          <div className="min-w-[150px]">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.2em]">
              Semestre
            </label>
            <div className="relative mt-2">
              <select
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={selectedSemester}
                onChange={(event) => { setSelectedSemester(Number(event.target.value)) }}
              >
                {['1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo'].map((label, index) => (
                  <option key={index + 1} value={index + 1}>
                    {label} Semestre
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 h-12 px-5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Crear Horario
          </button>

          <button
            type="button"
            className="flex items-center gap-2 h-12 px-5 rounded-xl border border-slate-200 bg-white text-red-600 text-sm font-semibold shadow-sm transition-colors hover:bg-red-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Eliminar Horario
          </button>
          <button
            type="button"
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-[#131a2a] text-white text-sm font-semibold shadow-sm transition-colors hover:bg-[#1a2340]"
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
                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Hora</th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Lunes</th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Martes</th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Miércoles</th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Jueves</th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Viernes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scheduleRows.map((row) => (
                  <tr
                    key={row.hour}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-[12px] font-bold text-[#14233f] whitespace-nowrap bg-slate-50">
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
