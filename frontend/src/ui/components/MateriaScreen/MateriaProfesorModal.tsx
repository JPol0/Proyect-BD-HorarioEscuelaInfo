import { useEffect, useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import { Magnifier } from '@gravity-ui/icons'
import type { Materia } from '../../../core/domain/Materia'
import type { Profesor } from '../../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'

interface MateriaProfesorModalProps {
  materia: Materia
}

const repository = new HttpProfesorRepository()

export function MateriaProfesorModal ({ materia }: MateriaProfesorModalProps) {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null)
        const lista = await repository.getProfesores()
        setProfesores(lista)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar profesores')
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
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans border border-slate-200">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-200 bg-slate-50">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex flex-col gap-0.5">
                  Asignar Profesores
                  <span className="text-sm font-normal text-slate-500">{materia.nombre}</span>
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="px-6 py-5 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
                {error != null && (
                  <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">⚠️ {error}</p>
                )}

                <div className="relative w-full flex items-center">
                  <span className="absolute left-3 z-10 pointer-events-none flex items-center">
                    <Magnifier className="text-slate-400 w-4 h-4" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Buscar profesor..."
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value) }}
                    className="w-full pl-9 pr-3 text-sm h-9 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                {cargando
                  ? (
                    <p className="text-xs text-slate-500 italic">Cargando profesores...</p>
                  )
                  : profesoresFiltrados.length === 0
                    ? (
                      <div className="text-sm text-slate-500">No se encontraron profesores con ese criterio.</div>
                    )
                    : (
                      <div className="space-y-2">
                        {profesoresFiltrados.map((profesor) => (
                          <div key={profesor.cedula} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{profesor.nombre}</p>
                              <p className="text-xs text-slate-500">{profesor.cedula}</p>
                            </div>
                            <Button size="sm" variant="light" onPress={close} className="text-xs">
                              Seleccionar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
              </Modal.Body>

              <Modal.Footer className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <Button variant="secondary" className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-5 h-9 cursor-pointer" onPress={close}>
                  Cerrar
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
