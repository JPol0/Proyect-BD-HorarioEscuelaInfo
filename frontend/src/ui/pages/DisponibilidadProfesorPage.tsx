import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../core/domain/DisponibilidadHoraria'
import type { Profesor } from '../../core/domain/Profesor'
import { HttpDisponibilidadRepository } from '../../core/infrastructure/adapters/HttpDisponibilidadRepository'
import { ObtenerDisponibilidadHoraria } from '../../core/application/useCases/ObtenerDisponibilidadHoraria'
import { ActualizarCeldaDisponibilidad } from '../../core/application/useCases/ActualizarCeldaDisponibilidad'
import { GuardarDisponibilidadHoraria } from '../../core/application/useCases/GuardarDisponibilidadHoraria'
import { DisponibilidadHeader } from '../components/disponibilidad/DisponibilidadHeader'
import { DisponibilidadGrid } from '../components/disponibilidad/DisponibilidadGrid'

const TERM_ACTIVO = '202615'
const CEDULA_PROFESOR_ACTUAL = 'V-12345678'

// Instanciación manual de dependencias (hexagonal)
const disponibilidadRepository = new HttpDisponibilidadRepository()
const obtenerDisponibilidadUseCase = new ObtenerDisponibilidadHoraria(disponibilidadRepository)
const actualizarCeldaUseCase = new ActualizarCeldaDisponibilidad()
const guardarDisponibilidadUseCase = new GuardarDisponibilidadHoraria(disponibilidadRepository)

export function DisponibilidadProfesorPage (): JSX.Element {
  const [profesor, setProfesor] = useState<Profesor | null>(null)
  const [grilla, setGrilla] = useState<DisponibilidadHoraria[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const cargarDatos = async (): Promise<void> => {
    try {
      setCargando(true)
      setError(null)
      const [profesorData, disponibilidadData] = await Promise.all([
        disponibilidadRepository.obtenerProfesor(CEDULA_PROFESOR_ACTUAL, TERM_ACTIVO),
        obtenerDisponibilidadUseCase.execute(CEDULA_PROFESOR_ACTUAL, TERM_ACTIVO)
      ])
      setProfesor(profesorData)
      setGrilla(disponibilidadData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la disponibilidad')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarDatos()
  }, [])

  const onCeldaClick = useCallback((dia: DiaSemana, numeroModulo: number): void => {
    setGrilla((actual) => actualizarCeldaUseCase.execute(actual, dia, numeroModulo))
  }, [])

  const onGuardar = useCallback(async (): Promise<void> => {
    try {
      setGuardando(true)
      setError(null)
      setMensajeExito(null)
      await guardarDisponibilidadUseCase.execute(CEDULA_PROFESOR_ACTUAL, TERM_ACTIVO, grilla)
      setMensajeExito('Disponibilidad guardada correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la disponibilidad')
    } finally {
      setGuardando(false)
    }
  }, [grilla])

  return (
    <div className="space-y-6">
      <DisponibilidadHeader profesor={profesor} codTerm={TERM_ACTIVO} guardando={guardando} onGuardar={() => { void onGuardar() }} />
      {cargando ? <p className="text-slate-600">Cargando disponibilidad...</p> : null}
      {error != null ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {mensajeExito != null ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{mensajeExito}</p> : null}
      {!cargando ? <DisponibilidadGrid grilla={grilla} onCeldaClick={onCeldaClick} /> : null}
    </div>
  )
}
