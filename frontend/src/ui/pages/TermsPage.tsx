import { useEffect, useState } from 'react'
import { HttpTermRepository } from '../../core/infrastructure/adapters/HttpTermRepository'
import { GetTerms } from '../../core/application/useCases/useCasesTerm/GetTerms'
import { CreateTerm } from '../../core/application/useCases/useCasesTerm/CreateTerm'
import { type Term } from '../../core/domain/Term'
import { type CreateTermInput } from '../../core/application/ports/TermRepository'
import Title from '../components/TitlePage'
import TermModal from '../components/TermScreen/TermModal'
import { useActiveTerm } from '../contexts/ActiveTermContext'

// Instanciación manual de dependencias (hexagonal)
const termRepository = new HttpTermRepository()
const getTermsUseCase = new GetTerms(termRepository)
const createTermUseCase = new CreateTerm(termRepository)

// Formatea "2026-08-01" → "Ago 2026" en español abreviado
function formatPeriodo(startDate: string, endDate: string): string {
  const meses: Record<string, string> = {
    '01': 'Ene',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dic'
  }
  const [startYear, startMonth] = startDate.split('-')
  const [endYear, endMonth] = endDate.split('-')
  return `${meses[startMonth]} ${startYear} - ${meses[endMonth]} ${endYear}`
}

export default function TermsPage() {
  const { activeTerm, setActiveTerm } = useActiveTerm()

  const [terms, setTerms] = useState<Term[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const cargarTerms = async () => {
    try {
      setError(null)
      const lista = await getTermsUseCase.execute()
      setTerms(lista)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los términos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarTerms()
  }, [])

  const handleCrear = async (input: CreateTermInput) => {
    await createTermUseCase.execute(input)
    await cargarTerms()
  }

  // Selecciona el término activo
  const handleSelectTerm = (term: Term) => {
    setActiveTerm(term)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header: Título + Botones */}
      <div className="flex items-start justify-between mb-2">
        <Title
          title="Terms Academicos"
          subtitle="Selecciona un term para trabajar sobre él, o crea un nuevo term para configurar su horario."
        />
        <div className="flex items-center gap-3 shrink-0 mt-1">
          {/* Botón New Term */}
          <button
            onClick={() => { setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1A5F7A] hover:opacity-90 rounded-lg transition font-hanken shadow-sm"
          >
            + New Term
          </button>
        </div>
      </div>

      {/* Banner de error */}
      {error !== null && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-hanken">
          ⚠️ {error}
        </div>
      )}

      {/* Estado de carga */}
      {cargando
        ? (
          <p className="text-slate-500 italic animate-pulse font-hanken mt-8">Cargando términos...</p>
        )
        : (
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-700 font-hanken mb-4">
              <span>📅</span> Términos Académicos
            </h2>
            {terms.length === 0 ? (
              <p className="text-slate-400 text-sm italic font-hanken">No hay términos creados.</p>
            ) : (
              <TermsTable
                terms={terms}
                activeTermId={activeTerm?.id ?? null}
                onSelect={handleSelectTerm}
              />
            )}
          </section>
        )}

      {/* Modal */}
      {showModal && (
        <TermModal
          onClose={() => { setShowModal(false) }}
          onCrear={handleCrear}
        />
      )}
    </div>
  )
}

// Sub-componente: tabla de terms
interface TermsTableProps {
  terms: Term[]
  activeTermId: string | null
  onSelect: (term: Term) => void
}

function TermsTable({ terms, activeTermId, onSelect }: TermsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Encabezado de tabla */}
      <div className="grid grid-cols-[1fr_200px] px-6 py-3 bg-white border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase font-hanken">Term</span>
        <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase font-hanken">Periodo</span>
      </div>

      {/* Filas */}
      {terms.map((term, index) => {
        const isActive = term.id === activeTermId
        return (
          <div
            key={term.id}
            onClick={() => { onSelect(term) }}
            className={[
              'grid grid-cols-[1fr_200px] px-6 py-4 items-center transition-colors cursor-pointer',
              index !== 0 ? 'border-t border-slate-50' : '',
              isActive
                ? 'bg-[#eaf4fb] border-l-4 border-l-[#1A5F7A]'
                : 'hover:bg-slate-50'
            ].join(' ')}
          >
            {/* Nombre del term + badge "Activo" */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 font-hanken">{term.name}</span>
              {isActive && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#1A5F7A] rounded-full px-2 py-0.5">
                  ✓ Trabajando
                </span>
              )}
            </div>

            {/* Periodo */}
            <span className="text-sm text-slate-400 font-hanken tracking-wide">
              {formatPeriodo(term.startDate, term.endDate)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
