import { useEffect, useState } from 'react'
import { Input, Select, ListBox } from '@heroui/react'
import { Magnifier } from '@gravity-ui/icons'

// Core Clean Architecture
import { HttpMateriaRepository } from '../../core/infrastructure/adapters/HttpMateriaRepository'
import { GetMaterias } from '../../core/application/useCases/useCasesMaterias/GetMaterias'
import { SaveMateria } from '../../core/application/useCases/useCasesMaterias/SaveMateria'
import { type Materia } from '../../core/domain/Materia'

import { getByCodigo, calcularSemestreMaximo } from '../../core/domain/services/MateriaServices'

// Sub-componentes reutilizables
import { MateriaCard } from '../components/MateriaScreen/MateriaCard'
import Title from '../components/TitlePage'

// Inyección manual de dependencias (Ya no instanciamos GetMateriaByCodigo)
const repository = new HttpMateriaRepository()
const getMateriasUseCase = new GetMaterias(repository)
const saveMateriaUseCase = new SaveMateria(repository)

// Helper para convertir números a romanos
const convertirARomano = (num: number): string => {
  const valoresRomanos: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let resultado = ''
  let valorRestante = num
  for (const key in valoresRomanos) {
    while (valorRestante >= valoresRomanos[key]) {
      resultado += key
      valorRestante -= valoresRomanos[key]
    }
  }
  return resultado
}

export function MateriasPage () {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedSemestre, setSelectedSemestre] = useState<string>('todos')

  const cargarMaterias = async () => {
    try {
      setLoading(true)
      const data = await getMateriasUseCase.execute()
      setMaterias(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargarMaterias()
  }, [])

  const handleUpdateSecciones = (codMateria: string, delta: number) => {
    setMaterias((prev) =>
      prev.map((m) => {
        if (m.codMateria === codMateria) {
          const nuevoNro = Math.max(0, m.nroSecciones + delta)
          return { ...m, nroSecciones: nuevoNro }
        }
        return m
      })
    )
  }

  const handleSaveMateria = async (materia: Materia) => {
    try {
      const verificacion = getByCodigo(materias, materia.codMateria)
      if (verificacion === undefined) throw new Error('La materia no existe en el catálogo local')

      await saveMateriaUseCase.execute(materia)
      alert(`Materia "${materia.nombre}" guardada correctamente.`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo guardar la materia')
    }
  }

  const materiasFiltradas = materias.filter((materia) => {
    const matchesSemestre = selectedSemestre === 'todos' || materia.semestre.toString() === selectedSemestre
    const matchesNombre = materia.nombre.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSemestre && matchesNombre
  })

  const obtenerSubtitulo = () => {
    if (selectedSemestre === 'todos') {
      return 'Visualizando el catálogo completo de asignaturas de la escuela.'
    }
    return `Gestionando las asignaturas correspondientes al Semestre ${convertirARomano(Number(selectedSemestre))}.`
  }

  // --- Lógica del Estado Derivado ---
  // 👇 Usamos la función pura para calcular dinámicamente los semestres
  const semestreMaximo = calcularSemestreMaximo(materias)
  const opcionesSemestres = Array.from({ length: semestreMaximo }, (_, i) => i + 1)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <Title
          title="Gestión de Materias"
          subtitle={obtenerSubtitulo()}
        />

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-end pb-8">

          {/* Selector de Semestre */}
          <div className="w-full sm:w-48 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Semestre</span>
            <Select
              aria-label="Filtrar por semestre"
              placeholder="Seleccionar semestre"
              variant="primary" // <-- Corregido a 'primary' según tu documentación
              value={selectedSemestre} // <-- Corregido a 'value'
              onChange={(valor) => { // <-- Corregido a 'onChange'
                if (valor) setSelectedSemestre(String(valor))
              }}
              className="w-full text-xs"
            >
              <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg p-2 bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 h-9">
                <Select.Value />
                <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
              </Select.Trigger>

              <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                <ListBox>
                  <ListBox.Item id="todos" textValue="Todos los semestres" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                    Todos los semestres
                  </ListBox.Item>

                  {/* --- Mapeo Dinámico --- */}
                  {opcionesSemestres.map((semestre) => (
                    <ListBox.Item
                      key={semestre.toString()}
                      id={semestre.toString()}
                      textValue={`Semestre ${convertirARomano(semestre)}`}
                      className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block"
                    >
                      Semestre {convertirARomano(semestre)}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Buscador por Nombre */}
          <div className="w-full sm:w-80 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Buscar</span>
            <div className="relative w-full flex items-center">
              <span className="absolute left-3 z-10 pointer-events-none flex items-center">
                <Magnifier className="text-slate-400 w-4 h-4" />
              </span>
              <Input
                type="text"
                placeholder="Buscar por nombre de materia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="primary" // <-- Corregido a 'primary' según tu documentación
                className="w-full pl-9 pr-3 text-sm h-9 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>

        </div>
      </div>

      {loading
        ? (
        <div className="text-center py-12 text-slate-400 font-sans">Cargando catálogo de materias...</div>
          )
        : error
          ? (
        <div className="text-center py-8 text-red-500 bg-red-50 border border-red-200 rounded-xl max-w-xl mx-auto p-4 font-sans">
          {error}
        </div>
            )
          : materiasFiltradas.length === 0
            ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 font-sans">
          No se encontraron materias bajo ese filtro.
        </div>
              )
            : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiasFiltradas.map((materia) => (
            <MateriaCard
              key={materia.codMateria}
              materia={materia}
              onUpdateSecciones={handleUpdateSecciones}
              onSave={handleSaveMateria}
            />
          ))}
        </div>
              )}
    </div>
  )
}
