import { Card, Button, Modal } from '@heroui/react'
import { Minus, Plus, Magnifier, Gear } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'
import { MateriaConsultarModal } from './MateriaConsultarModal'
import { MateriaConfiguracionModal } from './MateriaConfiguracionModal'
import { type DaysOfWeek } from '../../../core/domain/Horario'
import { MateriaDeleteButton } from './MateriaDeleteButton'
import { useUser } from '../../store/userStore'

interface MateriaCardProps {
  materia: Materia
  onSave: (materia: Materia) => void
  onDelete?: (codMateria: string) => void
  onAssignHours?: (materia: Materia, manualHours: Array<{ nroSeccion: number, dia: DaysOfWeek, hora: string, cantidad: number }>) => void
}

export function MateriaCard ({
  materia,
  onSave,
  onDelete,
  onAssignHours
}: MateriaCardProps) {
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'

  return (
    <Card className="w-full bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 rounded-xl h-full flex flex-col">

      <Card.Header className="px-1 pt-0.5 pb-0 flex flex-col items-start gap-1">
        <div className="flex items-center justify-between w-full gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Semestre {materia.semestre}
          {onDelete && !isLector && (
            <MateriaDeleteButton materia={materia} onDelete={onDelete} />
          )}
        </div>
        <Card.Title className="text-base font-bold text-slate-800 leading-snug">
          {materia.nombre}
        </Card.Title>
      </Card.Header>

      <Card.Content className="px-1 flex-1 justify-center">
        <div className="border-t border-slate-200 pt-4 mt-2 flex flex-col items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
            Secciones
          </label>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9 bg-slate-50/60 w-fit">
            <button
              type="button"
              disabled={materia.nroSecciones <= 0 || isLector}
              onClick={() => {
                const nuevoNro = Math.max(0, materia.nroSecciones - 1)
                onSave({ ...materia, nroSecciones: nuevoNro })
              }}
              className="px-3 h-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 text-sm font-semibold text-slate-700 border-x border-slate-200/60 min-w-9 text-center select-none">
              {materia.nroSecciones}
            </span>
            <button
              type="button"
              disabled={isLector}
              onClick={() => {
                onSave({ ...materia, nroSecciones: materia.nroSecciones + 1 })
              }}
              className="px-3 h-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card.Content>

      <Card.Footer className="px-1 pb-1 flex flex-col gap-2">
        <div className={`grid ${isLector ? 'grid-cols-1' : 'grid-cols-2'} gap-2 w-full`}>

          <Modal>
            <Button
              variant="secondary"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
            >
              <Magnifier className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              Información
            </Button>
            <MateriaConsultarModal
              materia={materia}
              onSave={(materiaActualizada) => { if (onSave) void onSave(materiaActualizada) }}
            />
          </Modal>

          {!isLector && (
            <Modal>
              <Button
                variant="secondary"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
              >
                <Gear className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Configuración
              </Button>
              <MateriaConfiguracionModal
                materia={materia}
                onAssignHours={onAssignHours}
              />
            </Modal>
          )}

        </div>
      </Card.Footer>
    </Card>
  )
}