import type { Term } from '../../core/domain/entities/Term'

interface Props {
  terms: Term[]
  loading: boolean
}

function formatPeriod (startDate: string, endDate: string): string {
  const fmt = (d: string): string => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return `${fmt(startDate)} – ${fmt(endDate)}`
}

export default function TermsTable ({ terms, loading }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (terms.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No hay terms registrados.
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-alt border-b border-border">
            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Term
            </th>
            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Periodo
            </th>
            <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Materias
            </th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term, idx) => (
            <tr
              key={term.id}
              className={`cursor-pointer transition-colors duration-100 hover:bg-surface-alt ${
                idx < terms.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <td className="px-5 py-3.5 font-medium text-sm text-text-primary">
                {term.name}
              </td>
              <td className="px-5 py-3.5 text-text-secondary text-xs">
                {formatPeriod(term.startDate, term.endDate)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <span className="inline-block px-2.5 py-0.5 bg-surface-alt border border-border rounded-full text-xs text-text-secondary font-medium">
                  {term.materias}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
