import { useState, useEffect, useCallback } from 'react'
import { HttpTermRepository } from '../../core/infrastructure/repositories/HttpTermRepository'
import { GetTermsUseCase } from '../../core/application/use-cases/GetTerms.use-case'
import { CreateTermUseCase } from '../../core/application/use-cases/CreateTerm.use-case'
import type { Term } from '../../core/domain/entities/Term'
import type { CreateTermInput } from '../../core/domain/ports/TermRepository.port'
import TermsTable from '../components/TermsTable'
import TermModal from '../components/TermModal'

// Dependency injection — swap HttpTermRepository for any other adapter here
const termRepository = new HttpTermRepository()
const getTerms = new GetTermsUseCase(termRepository)
const createTerm = new CreateTermUseCase(termRepository)

export default function TermsPage () {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTerms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTerms.execute()
      setTerms(data)
    } catch {
      setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en localhost:3000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadTerms() }, [loadTerms])

  const handleCreate = async (input: CreateTermInput) => {
    await createTerm.execute(input)
    await loadTerms()
  }

  const archived = terms.filter(t =>
    t.archived && t.name.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div className="px-10 py-9 max-w-[1100px]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8 gap-5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary">
            TERMS ACADEMICOS
          </h1>
          <p className="text-text-secondary mt-1.5 text-sm">
            Selecciona un term para ver su horario o crea un nuevo term para configurar su horario.
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          {/* Filter */}
          <div className="relative">
            <button
              id="btn-filter"
              onClick={() => setShowFilter(f => !f)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <span className="text-xs">▼</span> Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 top-[calc(100%+8px)] bg-surface border border-border rounded-xl p-3 w-[220px] shadow-lg z-10">
                <label htmlFor="filter-input" className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Buscar term
                </label>
                <input
                  id="filter-input"
                  type="text"
                  placeholder="ej. Primer Semestre…"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  autoFocus
                  className="w-full px-2.5 py-1.5 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
          </div>

          {/* New Term */}
          <button
            id="btn-new-term"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary rounded-lg text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            + New Term
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error != null && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Archived section */}
      <section aria-labelledby="archived-heading">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🗃️</span>
          <h2 id="archived-heading" className="text-[15px] font-semibold text-text-primary">
            Terms Archivados
          </h2>
          {!loading && (
            <span className="ml-1 bg-surface-alt border border-border rounded-full px-2.5 py-px text-[11px] text-text-muted font-medium">
              {archived.length}
            </span>
          )}
        </div>

        <TermsTable terms={archived} loading={loading} />
      </section>

      {/* Modal */}
      {showModal && (
        <TermModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  )
}
