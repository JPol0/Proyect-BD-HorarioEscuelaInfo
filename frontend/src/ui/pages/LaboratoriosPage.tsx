import { useEffect, useState } from 'react'
import { type Laboratorio } from '../../core/domain/Laboratorio'
import { HttpLaboratorioRepository } from '../../core/infrastructure/adapters/HttpLaboratorioRepository'
import { GetLaboratorios } from '../../core/application/useCases/useCasesLaboratorios/GetLaboratorios'
import { SaveLaboratorio } from '../../core/application/useCases/useCasesLaboratorios/SaveLaboratorio'
import { DeleteLaboratorio } from '../../core/application/useCases/useCasesLaboratorios/DeleteLaboratorio'
import Title from '../components/TitlePage'
import LaboratorioModal from '../components/LaboratorioScreen/LaboratorioModal'

// ─── Instanciación manual de dependencias (Hexagonal) ──────────────────────────
const repository = new HttpLaboratorioRepository()
const getLaboratoriosUseCase = new GetLaboratorios(repository)
const saveLaboratorioUseCase = new SaveLaboratorio(repository)
const deleteLaboratorioUseCase = new DeleteLaboratorio(repository)

// ─── Tipos del estado del modal ────────────────────────────────────────────────
interface ModalStateClosed {
  open: false
}

interface ModalStateOpen {
  open: true
  laboratorio: Laboratorio | null // null = creación, Laboratorio = edición
}

type ModalState = ModalStateClosed | ModalStateOpen

export default function LaboratoriosPage () {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState<ModalState>({ open: false })

  // ─── Carga inicial ────────────────────────────────────────────────────────────
  const cargarLaboratorios = async () => {
    try {
      setError(null)
      const lista = await getLaboratoriosUseCase.execute()
      setLaboratorios(lista)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los laboratorios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarLaboratorios()
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleGuardar = async (laboratorio: Laboratorio) => {
    // Actualización optimista
    setLaboratorios((prev) => {
      const index = prev.findIndex((l) => l.id === laboratorio.id)
      if (index !== -1) {
        return prev.map((l) => l.id === laboratorio.id ? laboratorio : l)
      }
      return [...prev, laboratorio]
    })
    await saveLaboratorioUseCase.execute(laboratorio)
  }

  const handleEliminar = async (id: string) => {
    const estadoPrevio = [...laboratorios]
    // Actualización optimista
    setLaboratorios((prev) => prev.filter((l) => l.id !== id))
    try {
      await deleteLaboratorioUseCase.execute(id)
    } catch (err) {
      // Rollback si falla
      setLaboratorios(estadoPrevio)
      setError(err instanceof Error ? err.message : 'Error al eliminar el laboratorio')
    }
  }

  // ─── Filtrado reactivo ─────────────────────────────────────────────────────────
  const laboratoriosFiltrados = laboratorios.filter((l) =>
    l.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header: Título + Botón */}
      <div className="flex items-start justify-between mb-4">
        <Title
          title="Gestión de Laboratorios"
          subtitle="Administra los laboratorios y salas disponibles para la planificación de horarios."
        />
        <div className="flex items-center gap-3 shrink-0 mt-1">
          <button
            onClick={() => { setModal({ open: true, laboratorio: null }) }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1A5F7A] hover:opacity-90 rounded-lg transition font-hanken shadow-sm"
          >
            + Añadir Laboratorio
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-8 max-w-md">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value) }}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] font-hanken text-slate-700 shadow-sm transition-all"
        />
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
          <p className="text-slate-500 italic animate-pulse font-hanken mt-8">Cargando laboratorios...</p>
          )
        : laboratoriosFiltrados.length === 0
          ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 font-hanken">
              {busqueda !== ''
                ? 'No se encontraron laboratorios con ese nombre.'
                : 'No hay laboratorios creados. Usa "+ Añadir Laboratorio" para comenzar.'}
            </div>
            )
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {laboratoriosFiltrados.map((lab) => (
                <LaboratorioCard
                  key={lab.id}
                  laboratorio={lab}
                  onModificar={() => { setModal({ open: true, laboratorio: lab }) }}
                  onEliminar={() => { void handleEliminar(lab.id) }}
                />
              ))}
            </div>
            )}

      {/* Modal de creación/edición */}
      {modal.open && (
        <LaboratorioModal
          laboratorio={modal.laboratorio}
          onClose={() => { setModal({ open: false }) }}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}

// ─── Sub-componente: tarjeta de laboratorio ────────────────────────────────────
interface LaboratorioCardProps {
  laboratorio: Laboratorio
  onModificar: () => void
  onEliminar: () => void
}

function LaboratorioCard ({ laboratorio, onModificar, onEliminar }: LaboratorioCardProps) {
  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-200">
      {/* Botón eliminar flotante y elegante (se muestra al hacer hover) */}
      <button
        onClick={onEliminar}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-100 shadow-sm"
        aria-label={`Eliminar ${laboratorio.name}`}
      >
        🗑️
      </button>

      {/* Nombre del laboratorio */}
      <div className="p-6 pt-8 pb-7 flex-1 flex flex-col justify-center min-h-[110px]">
        <h3 className="text-xl font-bold text-slate-800 font-hanken leading-snug tracking-tight">
          {laboratorio.name}
        </h3>
      </div>

      {/* Separador */}
      <div className="border-t border-slate-100" />

      {/* Acciones */}
      <div className="py-4 px-6 flex justify-center bg-white">
        <button
          onClick={onModificar}
          className="px-6 py-2 text-xs font-bold text-[#14233f] border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-hanken tracking-wider uppercase"
        >
          Modificar
        </button>
      </div>
    </div>
  )
}
