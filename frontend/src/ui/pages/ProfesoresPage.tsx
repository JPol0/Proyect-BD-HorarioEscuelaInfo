import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Magnifier } from '@gravity-ui/icons'
import { Input } from '@heroui/react'
import type { Profesor } from '../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../core/application/useCases/Profesores/GetProfesores'
import Title from '../components/common/TitlePage'

const repository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(repository)

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
        <div className="w-full md:w-80 flex flex-col gap-1.5 pb-8">
          <span className="text-xs font-semibold text-slate-500">Buscar</span>
          <div className="relative w-full flex items-center">
            <span className="absolute left-3 z-10 pointer-events-none flex items-center">
              <Magnifier className="text-slate-400 w-4 h-4" />
            </span>
            <Input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value) }}
              variant="primary"
              className="w-full pl-9 pr-3 text-sm h-9 border border-slate-200 rounded-lg bg-white focus:bg-slate-50 transition-colors"
            />
          </div>
        </div>
      </div>

      {error != null && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-hanken">
          {error}
        </div>
      )}

      {cargando
        ? (
          <p className="text-slate-500 italic animate-pulse font-hanken">Cargando profesores...</p>
          )
        : profesoresFiltrados.length === 0
          ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-hanken">
              No se encontraron profesores con ese criterio.
            </div>
            )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profesoresFiltrados.map((profesor) => (
                <div
                  key={profesor.cedula}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-hanken">{profesor.nombre}</h3>
                    <p className="text-xs text-slate-500 font-hanken mt-1">{profesor.cedula}</p>
                    <p className="text-xs text-slate-500 font-hanken">{profesor.correo}</p>
                  </div>
                  <button
                    onClick={() => { void navigate(`/profesores/${profesor.cedula}/disponibilidad`) }}
                    className="mt-auto w-full py-2 text-xs font-bold text-white bg-[#1A5F7A] hover:opacity-90 rounded-lg transition font-hanken tracking-widest uppercase"
                  >
                    Disponibilidad
                  </button>
                </div>
              ))}
            </div>
            )}
    </div>
  )
}
