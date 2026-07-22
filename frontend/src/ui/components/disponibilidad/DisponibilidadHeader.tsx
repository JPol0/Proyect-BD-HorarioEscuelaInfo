import type { JSX, ChangeEvent } from 'react'
import { useRef } from 'react'
import { FloppyDisk, File } from '@gravity-ui/icons'
import type { Profesor } from '../../../core/domain/Profesor'
import { useUser } from '../../store/userStore'

interface DisponibilidadHeaderProps {
  profesor: Profesor | null
  codTerm: string
  guardando: boolean
  onGuardar: () => void
  onCargarExcel: (arrayBuffer: ArrayBuffer) => void
}

export function DisponibilidadHeader ({ profesor, codTerm, guardando, onGuardar, onCargarExcel }: DisponibilidadHeaderProps): JSX.Element {
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile == null) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const buffer = evt.target?.result
      if (buffer instanceof ArrayBuffer) {
        onCargarExcel(buffer)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-subtitlePage">Profesores / Disponibilidad</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-titlePage mt-0.5">{profesor?.nombre ?? 'Profesor'}</h1>
        <p className="mt-1 text-xs sm:text-sm text-subtitlePage">Carga de Disponibilidad Horaria - Semestre {codTerm}</p>
      </div>
      {!isLector && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 sm:py-2.5 font-medium text-titlePage transition hover:bg-surface-hover min-h-[44px] sm:min-h-0 text-sm shadow-sm cursor-pointer"
          >
            <File className="w-4 h-4 shrink-0 text-subtitlePage" />
            Cargar Excel
          </button>
          <button
            type="button"
            onClick={onGuardar}
            disabled={guardando}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-button-primary px-5 py-3 sm:py-2.5 font-medium text-white transition hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-70 min-h-[44px] sm:min-h-0 text-sm shadow-sm cursor-pointer"
          >
            <FloppyDisk className="w-4 h-4 shrink-0" />
            {guardando ? 'Guardando...' : 'Guardar Disponibilidad'}
          </button>
        </div>
      )}
    </div>
  )
}
