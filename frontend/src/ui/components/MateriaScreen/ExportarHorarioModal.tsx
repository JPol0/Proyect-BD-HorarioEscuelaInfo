import { useState } from 'react'
import { Modal, Button } from '@heroui/react'
import type { ExportFormat, ExportScope, ScheduleExportConfig } from '../../../core/domain/ScheduleExport'

export interface ExportarHorarioModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSemester: number
  onConfirmExport: (config: ScheduleExportConfig) => void
}

function convertirARomano(num: number): string {
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

export function ExportarHorarioModal({
  isOpen,
  onClose,
  selectedSemester,
  onConfirmExport
}: ExportarHorarioModalProps) {
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [scope, setScope] = useState<ExportScope>('current_semester')

  if (!isOpen) return null

  const handleExport = () => {
    onConfirmExport({
      format,
      scope,
      selectedSemester
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100 flex flex-col">
            {({ close }) => (
              <>
                <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

                <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-600">
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Exportar Horarios
                  </Modal.Heading>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Selecciona el formato y el alcance deseado para el reporte.
                  </p>
                </Modal.Header>

                <Modal.Body className="px-6 py-5 overflow-y-auto bg-white flex flex-col gap-5">
                  {/* Selector de Formato */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Formato de Archivo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormat('excel')}
                        className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${format === 'excel'
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-600 font-bold text-sm">📊 Excel</span>
                        </div>
                        <span className="text-[11px] text-slate-600 leading-tight">
                          Tabla consolidada por materia y profesor.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormat('pdf')}
                        className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${format === 'pdf'
                          ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-rose-600 font-bold text-sm">📄 PDF</span>
                        </div>
                        <span className="text-[11px] text-slate-600 leading-tight">
                          Grilla visual paginada (1 página por semestre).
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Selector de Alcance */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Alcance del Reporte
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${scope === 'current_semester'
                        ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <input
                          type="radio"
                          name="scope"
                          value="current_semester"
                          checked={scope === 'current_semester'}
                          onChange={() => setScope('current_semester')}
                          className="accent-indigo-600"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800 block">
                            Semestre Actual ({convertirARomano(selectedSemester)})
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            Exporta únicamente las materias del semestre seleccionado actualmente.
                          </span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${scope === 'all_semesters'
                        ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <input
                          type="radio"
                          name="scope"
                          value="all_semesters"
                          checked={scope === 'all_semesters'}
                          onChange={() => setScope('all_semesters')}
                          className="accent-indigo-600"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800 block">
                            Todos los Semestres
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            Exporta el horario completo con la totalidad de semestres programados.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                  <Button variant="secondary" className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-4 h-9 cursor-pointer" onPress={close}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 h-9 cursor-pointer shadow-sm"
                    onPress={handleExport}
                  >
                    Exportar
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
