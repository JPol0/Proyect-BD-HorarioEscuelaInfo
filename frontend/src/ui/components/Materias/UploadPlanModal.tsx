import { useRef, useState, useCallback } from 'react'
import { Modal, Button } from '@heroui/react'
import { HttpMateriaRepository } from '../../../core/infrastructure/adapters/HttpMateriaRepository'
import { UploadPlanEstudioExcel } from '../../../core/application/useCases/Materias/UploadPlanEstudioExcel'

const repository = new HttpMateriaRepository()
const uploadUseCase = new UploadPlanEstudioExcel(repository)

interface UploadPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

type UploadState = 'idle' | 'loading' | 'success' | 'error'

export default function UploadPlanModal ({ isOpen, onClose }: UploadPlanModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [result, setResult] = useState<{ count: number, skipped: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setErrorMsg('Por favor selecciona un archivo Excel (.xlsx o .xls)')
      return
    }
    setFile(f)
    setErrorMsg(null)
    setUploadState('idle')
    setResult(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped != null) handleFile(dropped)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f != null) handleFile(f)
  }

  const handleUpload = async () => {
    if (file == null) {
      setErrorMsg('Selecciona un archivo Excel primero')
      return
    }
    setUploadState('loading')
    setErrorMsg(null)
    try {
      const res = await uploadUseCase.execute(file)
      setResult(res)
      setUploadState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido al procesar el archivo')
      setUploadState('error')
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop className="bg-slate-900/50 backdrop-blur-sm z-50">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in">
            {({ close }) => (
              <>
                <Modal.CloseTrigger
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  onClick={() => { onClose(); close() }}
                />

              {/* Header */}
              <Modal.Header className="px-7 pt-7 pb-5 border-b border-slate-100 bg-gradient-to-r from-[#1A5F7A]/5 to-transparent">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2.5 font-hanken">
                  <span className="text-xl">📥</span>
                  Cargar Plan de Estudio
                </Modal.Heading>
                <p className="text-xs text-slate-500 mt-1 font-hanken">
                  Importa masivamente las asignaturas desde el archivo oficial Excel
                </p>
              </Modal.Header>

              {/* Body */}
              <Modal.Body className="px-7 py-5 space-y-5 bg-white">

                {/* Drag & Drop zone */}
                {uploadState !== 'success' && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => { fileInputRef.current?.click() }}
                    className={[
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 select-none',
                      isDragging
                        ? 'border-[#1A5F7A] bg-[#1A5F7A]/5 scale-[1.01]'
                        : file != null
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-slate-200 bg-slate-50 hover:border-[#1A5F7A]/50 hover:bg-[#1A5F7A]/3'
                    ].join(' ')}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                    {file != null ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">✅</span>
                        <p className="text-sm font-semibold text-emerald-700 font-hanken">{file.name}</p>
                        <p className="text-xs text-slate-400 font-hanken">
                          {(file.size / 1024).toFixed(1)} KB · Haz clic para cambiar el archivo
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5">
                        <span className="text-4xl">📄</span>
                        <p className="text-sm font-semibold text-slate-600 font-hanken">
                          Arrastra el archivo Excel aquí
                        </p>
                        <p className="text-xs text-slate-400 font-hanken">
                          o haz clic para seleccionar · Solo archivos <span className="font-semibold">.xlsx</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Success state */}
                {uploadState === 'success' && result != null && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
                    <div className="text-4xl mb-1">🎉</div>
                    <p className="text-base font-bold text-emerald-800 font-hanken">
                      ¡Plan de Estudio cargado exitosamente!
                    </p>
                    <p className="text-sm text-emerald-700 font-hanken">
                      Se importaron <span className="font-bold">{result.count}</span> materias en los términos registrados
                      {result.skipped > 0 && (
                        <span className="text-slate-500"> · {result.skipped} filas omitidas</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Error message */}
                {errorMsg != null && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    <p className="text-xs text-red-700 font-hanken">⚠️ {errorMsg}</p>
                  </div>
                )}

                {/* Loading indicator */}
                {uploadState === 'loading' && (
                  <div className="flex items-center justify-center gap-3 py-2">
                    <svg className="animate-spin h-5 w-5 text-[#1A5F7A]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-slate-600 font-hanken animate-pulse">
                      Procesando el Plan de Estudio...
                    </span>
                  </div>
                )}
              </Modal.Body>

              {/* Footer */}
              <Modal.Footer className="px-7 pb-6 pt-4 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/30">
                <Button
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs h-9 px-4 rounded-lg transition-colors cursor-pointer font-hanken"
                  onPress={() => { onClose(); close() }}
                  isDisabled={uploadState === 'loading'}
                >
                  {uploadState === 'success' ? 'Cerrar' : 'Cancelar'}
                </Button>
                {uploadState !== 'success' && (
                  <Button
                    variant="primary"
                    className="bg-[#1A5F7A] hover:opacity-90 text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 font-hanken flex items-center gap-2"
                    onPress={() => { void handleUpload() }}
                    isDisabled={file == null || uploadState === 'loading'}
                  >
                    {uploadState === 'loading' ? 'Importando...' : '📥 Importar Plan'}
                  </Button>
                )}
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
    </Modal>
  )
}
