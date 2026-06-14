import { useCallback, useEffect, useState } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../core/domain/DisponibilidadHoraria'
import type { Profesor } from '../../core/domain/Profesor'
import { container, TERM_ACTIVO } from '../../core/infrastructure/config/dependencies'

interface UseDisponibilidadHorariaResult {
  profesor: Profesor | null
  grilla: DisponibilidadHoraria[]
  cargando: boolean
  guardando: boolean
  error: string | null
  mensajeExito: string | null
  onCeldaClick: (dia: DiaSemana, numeroModulo: number) => void
  onGuardar: () => Promise<void>
}

export function useDisponibilidadHoraria (cedulaProfesor: string): UseDisponibilidadHorariaResult {
  const [profesor, setProfesor] = useState<Profesor | null>(null)
  const [grilla, setGrilla] = useState<DisponibilidadHoraria[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      try {
        setCargando(true)
        setError(null)
        const [profesorData, disponibilidadData] = await Promise.all([
          container.obtenerProfesorActivo.execute(cedulaProfesor),
          container.obtenerDisponibilidadHoraria.execute(cedulaProfesor, TERM_ACTIVO)
        ])
        setProfesor(profesorData)
        setGrilla(disponibilidadData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar la disponibilidad'
        setError(message)
      } finally {
        setCargando(false)
      }
    }

    void cargar()
  }, [cedulaProfesor])

  const onCeldaClick = useCallback((dia: DiaSemana, numeroModulo: number): void => {
    setGrilla((actual) => container.actualizarCeldaDisponibilidad.execute(actual, dia, numeroModulo))
  }, [])

  const onGuardar = useCallback(async (): Promise<void> => {
    try {
      setGuardando(true)
      setError(null)
      setMensajeExito(null)
      await container.guardarDisponibilidadHoraria.execute(cedulaProfesor, TERM_ACTIVO, grilla)
      setMensajeExito('Disponibilidad guardada correctamente')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la disponibilidad'
      setError(message)
    } finally {
      setGuardando(false)
    }
  }, [cedulaProfesor, grilla])

  return { profesor, grilla, cargando, guardando, error, mensajeExito, onCeldaClick, onGuardar }
}
