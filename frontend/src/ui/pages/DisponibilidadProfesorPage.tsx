import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { DiaSemana, DisponibilidadHoraria, NivelDisponibilidad } from '../../core/domain/DisponibilidadHoraria'
import type { Profesor } from '../../core/domain/Profesor'
import { HttpDisponibilidadRepository } from '../../core/infrastructure/adapters/HttpDisponibilidadRepository'
import { ObtenerDisponibilidadHoraria } from '../../core/application/useCases/DisponibilidadHoraria/ObtenerDisponibilidadHoraria'
import { ActualizarCeldaDisponibilidad } from '../../core/application/useCases/DisponibilidadHoraria/ActualizarCeldaDisponibilidad'
import { GuardarDisponibilidadHoraria } from '../../core/application/useCases/DisponibilidadHoraria/GuardarDisponibilidadHoraria'
import { DisponibilidadHeader } from '../components/disponibilidad/DisponibilidadHeader'
import { DisponibilidadGrid } from '../components/disponibilidad/DisponibilidadGrid'
import { useActiveTerm } from '../store/activeTermStore'

const disponibilidadRepository = new HttpDisponibilidadRepository()
const obtenerDisponibilidadUseCase = new ObtenerDisponibilidadHoraria(disponibilidadRepository)
const actualizarCeldaUseCase = new ActualizarCeldaDisponibilidad()
const guardarDisponibilidadUseCase = new GuardarDisponibilidadHoraria(disponibilidadRepository)

export function DisponibilidadProfesorPage (): JSX.Element {
  const { cedula } = useParams<{ cedula: string }>()
  const navigate = useNavigate()
  const { activeTerm } = useActiveTerm()
  const termId = activeTerm?.id ?? '2026-25'
  const cedulaProfesor = cedula ?? 'V-12345678'

  const [profesor, setProfesor] = useState<Profesor | null>(null)
  const [grilla, setGrilla] = useState<DisponibilidadHoraria[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const cargarDatos = useCallback(async (): Promise<void> => {
    try {
      setCargando(true)
      setError(null)
      const [profesorData, disponibilidadData] = await Promise.all([
        disponibilidadRepository.obtenerProfesor(cedulaProfesor, termId),
        obtenerDisponibilidadUseCase.execute(cedulaProfesor, termId)
      ])
      setProfesor(profesorData)
      setGrilla(disponibilidadData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la disponibilidad')
    } finally {
      setCargando(false)
    }
  }, [cedulaProfesor, termId])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const onCeldaClick = useCallback((dia: DiaSemana, numeroModulo: number): void => {
    setGrilla((actual) => actualizarCeldaUseCase.execute(actual, dia, numeroModulo))
  }, [])

  const onCeldaValueChange = useCallback((dia: DiaSemana, numeroModulo: number, valor: NivelDisponibilidad): void => {
    setGrilla((actual) => actual.map((celda) => {
      if (celda.dia !== dia || celda.numeroModulo !== numeroModulo || celda.ocupado) {
        return celda
      }
      return {
        ...celda,
        disponibilidad: valor
      }
    }))
  }, [])

  const onGuardar = useCallback(async (): Promise<void> => {
    try {
      setGuardando(true)
      setError(null)
      setMensajeExito(null)
      await guardarDisponibilidadUseCase.execute(cedulaProfesor, termId, grilla)
      setMensajeExito('Disponibilidad guardada correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la disponibilidad')
    } finally {
      setGuardando(false)
    }
  }, [cedulaProfesor, termId, grilla])

  return (
    <div className="space-y-6 p-6">
      <button
        onClick={() => { void navigate('/profesores') }}
        className="text-sm text-button-primary hover:underline font-hanken mb-2 flex items-center gap-1"
      >
        ← Volver a Profesores
      </button>
      <DisponibilidadHeader profesor={profesor} codTerm={termId} guardando={guardando} onGuardar={() => { void onGuardar() }} />
      {cargando ? <p className="text-subtitlePage font-hanken">Cargando disponibilidad...</p> : null}
      {error != null ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {mensajeExito != null ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{mensajeExito}</p> : null}
      {!cargando ? <DisponibilidadGrid grilla={grilla} onCeldaClick={onCeldaClick} onCeldaValueChange={onCeldaValueChange} /> : null}
    </div>
  )
}
