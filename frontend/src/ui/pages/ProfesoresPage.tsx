import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Magnifier, Plus } from '@gravity-ui/icons'
import { Input, Modal, Button } from '@heroui/react'
import type { Profesor } from '../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../core/application/useCases/Profesores/GetProfesores'
import { CrearProfesorModal } from '../components/ProfesoresScreen/CrearProfesorModal'
import Title from '../components/TitlePage'

const repository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(repository)

const STATUS_CONFIG = {
  A: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  P: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  R: { label: 'Retirado', color: 'bg-red-100 text-red-600' }
}

export function ProfesoresPage () {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null)
        const lista = await getProfesoresUseCase.execute()
        setProfesores(lista)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los profesores')
      } finally {
        setCargando(false)
      }
    }
    void cargar()
  }, [])

  const handleStatusChange = async (cedula: string, status: Profesor['status']) => {
    try {
      const actualizado = await repository.actualizarStatus(cedula, status)
      setProfesores((prev) => prev.map((p) => p.cedula === cedula ? actualizado : p))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el status')
    }
  }

  const handleCreado = (nuevo: Profesor) => {
    setProfesores((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
  }

  const profesoresFiltrados = profesores.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cedula.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Title
          title="Gestión de Profesores"
          subtitle="Lista de docentes disponibles para la asignación de horarios."
        />
        <div className="flex items-center gap-3 shrink-0">
          <Modal>
            <Button
              variant="primary"
              className="bg-button-primary hover:bg-button-primary-hover text-white text-xs font-semibold px-4 h-9 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Profesor
            </Button>
            <CrearProfesorModal onCreado={handleCreado} />
          </Modal>
        </div>
      </div>

      <div className="w-full md:w-80">
        <div className="relative w-full flex items-center">
          <span className="absolute left-3 z-10 pointer-events-none flex items-center">
            <Magnifier className="text-text-muted w-4 h-4" />
          </span>
          <Input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value) }}
            variant="primary"
            className="w-full pl-9 pr-3 text-sm h-9 border border-border rounded-lg bg-surface focus:bg-surface-alt transition-colors"
          />
        </div>
      </div>

      {error != null && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-hanken">
          {error}
        </div>
      )}

      {cargando
        ? (
          <p className="text-subtitlePage italic animate-pulse font-hanken">Cargando profesores...</p>
        )
        : profesoresFiltrados.length === 0
          ? (
            <div className="text-center py-12 text-text-muted bg-surface-alt rounded-xl border border-dashed border-border font-hanken">
              No se encontraron profesores con ese criterio.
            </div>
          )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profesoresFiltrados.map((profesor) => {
                const cfg = STATUS_CONFIG[profesor.status]
                return (
                  <div
                    key={profesor.cedula}
                    className="bg-surface rounded-xl border border-border shadow-sm p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-titlePage font-hanken truncate">{profesor.nombre}</h3>
                        <p className="text-xs text-subtitlePage font-hanken mt-0.5">{profesor.cedula}</p>
                        <p className="text-xs text-text-muted font-hanken">{profesor.correo}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Estado</label>
                      <select
                        value={profesor.status}
                        onChange={(e) => { void handleStatusChange(profesor.cedula, e.target.value as Profesor['status']) }}
                        className="text-xs border border-border rounded-lg px-3 py-1.5 bg-surface-alt text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-button-primary transition-colors"
                      >
                        <option value="A">Activo</option>
                        <option value="P">Pendiente</option>
                        <option value="R">Retirado</option>
                      </select>
                    </div>

                    <button
                      onClick={() => { void navigate(`/profesores/${profesor.cedula}/disponibilidad`) }}
                      disabled={profesor.status === 'R'}
                      className="mt-auto w-full py-2 text-xs font-bold text-white bg-button-primary hover:bg-button-primary-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition font-hanken tracking-widest uppercase"
                    >
                      Cargar Horario
                    </button>
                  </div>
                )
              })}
            </div>
          )}
    </div>
  )
}
