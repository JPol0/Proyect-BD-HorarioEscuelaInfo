import { useState, useEffect } from 'react'
import { Modal, Button } from '@heroui/react'
import { type Materia } from '../../../core/domain/Materia'
import { type DaysOfWeek } from '../../../core/domain/Horario'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'
import { GetProfesores } from '../../../core/application/useCases/Profesores/GetProfesores'
import { HttpLaboratorioRepository } from '../../../core/infrastructure/adapters/HttpLaboratorioRepository'
import { GetLaboratorios } from '../../../core/application/useCases/Laboratorios/GetLaboratorios'
import { Book } from '@gravity-ui/icons'

const profesorRepository = new HttpProfesorRepository()
const getProfesoresUseCase = new GetProfesores(profesorRepository)

const laboratorioRepository = new HttpLaboratorioRepository()
const getLaboratoriosUseCase = new GetLaboratorios(laboratorioRepository)

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

export interface DetalleHorarioModalProps {
  isOpen: boolean
  onClose: () => void
  materia: Materia
  seccion: number
  dia: DaysOfWeek
  horaStr: string // Ej: '07:00 - 07:50'
  cedulaProfesor?: string
  laboratorioId?: number
}

export function DetalleHorarioModal ({
  isOpen,
  onClose,
  materia,
  seccion,
  dia,
  horaStr,
  cedulaProfesor,
  laboratorioId
}: DetalleHorarioModalProps) {
  const [profesorNombre, setProfesorNombre] = useState<string>('Cargando...')
  const [laboratorioNombre, setLaboratorioNombre] = useState<string>('Cargando...')

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      try {
        if (cedulaProfesor && cedulaProfesor !== 'undefined') {
          const profes = await getProfesoresUseCase.execute()
          const p = profes.find(x => x.cedula === cedulaProfesor)
          setProfesorNombre(p ? p.nombre : cedulaProfesor)
        } else {
          setProfesorNombre('Sin asignar')
        }

        if (laboratorioId !== undefined) {
          const labs = await getLaboratoriosUseCase.execute()
          const l = labs.find(x => x.id === laboratorioId)
          setLaboratorioNombre(l ? l.name : String(laboratorioId))
        }
      } catch (err) {
        console.error(err)
        setProfesorNombre(cedulaProfesor || 'Error')
        setLaboratorioNombre(laboratorioId !== undefined ? String(laboratorioId) : 'Error')
      }
    }

    void fetchData()
  }, [isOpen, cedulaProfesor, laboratorioId])

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100">
            {({ close }) => (
              <>
                <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

                <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                  <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Book className="w-5 h-5 text-slate-500" />
                    Detalles del Horario
                  </Modal.Heading>
                </Modal.Header>

                <Modal.Body className="px-6 py-5 space-y-5 bg-white">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 mt-0.5">
                      {materia.nombre} (Sección {convertirARomano(seccion)})
                    </h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {dia} {horaStr}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2 text-sm text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">Tipo:</span> {laboratorioId ? 'Laboratorio' : 'Teoría/Práctica'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Profesor:</span> {profesorNombre}
                    </div>
                    {laboratorioId && (
                      <div>
                        <span className="font-semibold text-slate-900">Laboratorio:</span> {laboratorioNombre}
                      </div>
                    )}
                  </div>
                </Modal.Body>

                <Modal.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                  <Button variant="secondary" className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-5 h-9 cursor-pointer" onPress={close}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
