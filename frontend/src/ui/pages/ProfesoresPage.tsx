import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Magnifier, Plus } from '@gravity-ui/icons'
import { Input, Select, ListBox, Modal, Button, Tooltip } from '@heroui/react'
import type { Profesor } from '../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../core/application/useCases/Profesores/GetProfesores'
import { ActualizarStatusProfesor } from '../../core/application/useCases/Profesores/ActualizarStatusProfesor'
import { CrearProfesorModal } from '../components/ProfesoresScreen/CrearProfesorModal'
import Title from '../components/common/TitlePage'
import { useUser } from '../store/userStore'

const repository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(repository)
const actualizarStatusUseCase = new ActualizarStatusProfesor(repository)

const STATUS_CONFIG = {
  A: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  ER: { label: 'En Reposo', color: 'bg-amber-100 text-amber-700' },
  R: { label: 'Retirado', color: 'bg-red-100 text-red-600' }
}

const STATUS_OPTIONS = [
  { id: 'A', label: 'Activo' },
  { id: 'ER', label: 'En Reposo' },
  { id: 'R', label: 'Retirado' }
]

export function ProfesoresPage () {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | Profesor['status']>('todos')
  const navigate = useNavigate()
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'

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

  const handleStatusChange = async (cedula: string, status: Profesor['status']): Promise<void> => {
    setError(null)
    const previous = [...profesores]
    setProfesores((prev) => prev.map((p) =>
      p.cedula === cedula ? { ...p, status } : p
    ))

    try {
      await actualizarStatusUseCase.execute(cedula, status)
    } catch (err) {
      setProfesores(previous)
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado del profesor')
    }
  }

  const handleCreado = (nuevo: Profesor) => {
    setProfesores((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
  }

  const profesoresFiltrados = profesores.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cedula.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' || p.status === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-9 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Title
          title="Gestión de Profesores"
          subtitle="Lista de docentes disponibles para la asignación de horarios."
        />
        {!isLector && (
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <Modal>
              <Button
                variant="primary"
                className="bg-button-primary hover:bg-button-primary-hover text-white text-xs font-semibold px-4 h-11 sm:h-9 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Añadir Profesor
              </Button>
              <CrearProfesorModal onCreado={handleCreado} />
            </Modal>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch sm:items-end pb-4">
        {/* Buscador */}
        <div className="w-full sm:w-80 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-muted">Buscar</span>
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
              className="w-full pl-9 pr-3 text-sm h-11 sm:h-9 border border-border rounded-lg bg-surface focus:bg-surface-alt transition-colors"
            />
          </div>
        </div>

        <div className="w-full sm:w-48 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-muted">Estado</span>
          <Select
            aria-label="Filtrar por estado"
            placeholder="Seleccionar estado"
            variant="primary"
            value={filtroEstado}
            onChange={(valor) => {
              if (valor) setFiltroEstado(String(valor) as 'todos' | Profesor['status'])
            }}
            className="w-full text-xs"
          >
            <Select.Trigger className="flex justify-between items-center w-full border border-border rounded-lg px-3 bg-surface-alt hover:bg-surface transition-colors text-sm text-text-primary h-11 sm:h-9">
              <Select.Value />
              <Select.Indicator className="text-text-muted text-[10px] ml-2">▼</Select.Indicator>
            </Select.Trigger>
            <Select.Popover placement="bottom start" className="bg-surface border border-border shadow-lg rounded-lg p-1 min-w-45 z-50">
              <ListBox>
                <ListBox.Item id="todos" textValue="Todos" className="px-3 py-2 text-xs text-text-primary rounded-md hover:bg-surface-alt cursor-pointer min-h-[44px] flex items-center">
                  Todos
                </ListBox.Item>
                <ListBox.Item id="A" textValue="Activo" className="px-3 py-2 text-xs text-text-primary rounded-md hover:bg-surface-alt cursor-pointer min-h-[44px] flex items-center">
                  Activo
                </ListBox.Item>
                <ListBox.Item id="ER" textValue="En Reposo" className="px-3 py-1.5 text-xs text-text-primary rounded-md hover:bg-surface-alt cursor-pointer block">
                  En Reposo
                </ListBox.Item>
                <ListBox.Item id="R" textValue="Retirado" className="px-3 py-2 text-xs text-text-primary rounded-md hover:bg-surface-alt cursor-pointer min-h-[44px] flex items-center">
                  Retirado
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profesoresFiltrados.map((profesor) => {
                const cfg = STATUS_CONFIG[profesor.status]
                return (
                  <div
                    key={profesor.cedula}
                    className="bg-surface rounded-xl border border-border shadow-sm p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <Tooltip.Trigger className="block min-w-0 w-full text-left cursor-default">
                            <h3 className="text-base font-bold text-titlePage font-hanken truncate">
                              {profesor.nombre}
                            </h3>
                          </Tooltip.Trigger>
                          <Tooltip.Content className="bg-surface border border-border text-titlePage text-xs font-hanken px-2.5 py-1.5 rounded-md shadow-md z-50">
                            {profesor.nombre}
                          </Tooltip.Content>
                        </Tooltip>
                        <p className="text-xs text-subtitlePage font-hanken mt-0.5">{profesor.cedula}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Estado</label>
                      {isLector ? (
                        <div className="flex justify-between items-center w-full border border-border rounded-lg px-3 bg-surface-alt text-xs text-text-primary h-11 sm:h-9 font-hanken">
                          {cfg.label}
                        </div>
                          )
                        : (
                        <Select
                          variant="primary"
                          value={profesor.status}
                          onChange={(valor) => { if (valor) void handleStatusChange(profesor.cedula, valor as Profesor['status']) }}
                          className="w-full text-sm"
                        >
                          <Select.Trigger className="flex justify-between items-center w-full border border-border rounded-lg px-3 bg-surface-alt hover:bg-surface transition-colors text-xs text-text-primary h-11 sm:h-9">
                            <Select.Value />
                            <Select.Indicator className="text-text-muted text-[10px] ml-2">▼</Select.Indicator>
                          </Select.Trigger>
                          <Select.Popover placement="bottom start" className="bg-surface border border-border shadow-lg rounded-lg p-1 z-50">
                            <ListBox>
                              {STATUS_OPTIONS.map((opt) => (
                                <ListBox.Item
                                  key={opt.id}
                                  id={opt.id}
                                  textValue={opt.label}
                                  className="px-3 py-2 text-xs text-text-primary rounded-md hover:bg-surface-alt cursor-pointer min-h-[44px] flex items-center"
                                >
                                  {opt.label}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                          )}
                    </div>

                    <button
                      onClick={() => { void navigate(`/profesores/${profesor.cedula}/disponibilidad`) }}
                      disabled={profesor.status === 'R'}
                      className="mt-auto w-full py-2.5 text-xs font-bold text-white bg-button-primary hover:bg-button-primary-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition font-hanken tracking-widest uppercase min-h-[44px] flex items-center justify-center"
                    >
                      Disponibilidad
                    </button>
                  </div>
                )
              })}
            </div>
            )}
    </div>
  )
}
