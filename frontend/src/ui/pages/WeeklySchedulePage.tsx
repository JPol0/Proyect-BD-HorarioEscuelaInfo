import { useEffect, useMemo, useState } from 'react'
import type { WeeklySchedule } from '../../core/domain/WeeklySchedule'
import { GetWeeklySchedule } from '../../core/application/useCases/GetWeeklySchedule'
import { ApiWeeklyScheduleRepository } from '../../core/infrastructure/adapters/ApiWeeklyScheduleRepository'

const repository = new ApiWeeklyScheduleRepository()
const getWeeklyScheduleUseCase = new GetWeeklySchedule(repository)

export default function WeeklySchedulePage () {
  const [data, setData] = useState<WeeklySchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodId, setPeriodId] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('2026-15')

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      setError(null)
      try {
        const payload = await getWeeklyScheduleUseCase.execute(selectedTerm)
        setData(payload)
        if (payload.periods.length > 0) {
          setPeriodId(payload.periods[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor.')
      } finally {
        setLoading(false)
      }
    }

    void loadSchedule()
  }, [selectedTerm])

  const periodOptions = useMemo(() => {
    if (!data) return []
    return data.periods
  }, [data])

  const scheduleRows = data?.schedule ?? []

  return (
    <div className="px-10 py-9 max-w-[1200px]">
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
          <div className="min-w-[180px]">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.2em]">
              Semestre
            </label>
            <div className="relative mt-2">
              <select
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={selectedTerm}
                onChange={(event) => setSelectedTerm(event.target.value)}
              >
                <option value="2026-15">1er Semestre - 2026</option>
                <option value="2026-20">2do Semestre - 2026</option>
              </select>
            </div>
          </div>

          <div className="min-w-[210px]">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.2em]">
              Periodo
            </label>
            <div className="relative mt-2">
              <select
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={periodId}
                onChange={(event) => setPeriodId(event.target.value)}
                disabled={periodOptions.length === 0}
              >
                <option value="" disabled>
                  Seleccionar periodo
                </option>
                {periodOptions.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.label}
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
              <path d="M4 7h10M4 17h7M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="14" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            Filtros
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
