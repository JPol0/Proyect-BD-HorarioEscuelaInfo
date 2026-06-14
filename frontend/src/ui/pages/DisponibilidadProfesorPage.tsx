import type { JSX } from 'react'
import { DisponibilidadHeader } from '../components/disponibilidad/DisponibilidadHeader'
import { DisponibilidadGrid } from '../components/disponibilidad/DisponibilidadGrid'
import { useDisponibilidadHoraria } from '../hooks/useDisponibilidadHoraria'
import { TERM_ACTIVO } from '../../core/infrastructure/config/dependencies'

const CEDULA_PROFESOR_ACTUAL = 'V-12345678'

export function DisponibilidadProfesorPage (): JSX.Element {
  const { profesor, grilla, cargando, guardando, error, mensajeExito, onCeldaClick, onGuardar } =
    useDisponibilidadHoraria(CEDULA_PROFESOR_ACTUAL)

  return (
    <div className="space-y-6">
      <DisponibilidadHeader profesor={profesor} codTerm={TERM_ACTIVO} guardando={guardando} onGuardar={onGuardar} />
      {cargando ? <p className="text-slate-600">Cargando disponibilidad...</p> : null}
      {error != null ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {mensajeExito != null ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{mensajeExito}</p> : null}
      {!cargando ? <DisponibilidadGrid grilla={grilla} onCeldaClick={onCeldaClick} /> : null}
    </div>
  )
}
