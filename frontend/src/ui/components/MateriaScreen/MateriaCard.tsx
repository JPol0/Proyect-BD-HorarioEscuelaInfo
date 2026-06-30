import { Card, Button, Modal } from '@heroui/react'
import { Minus, Plus, Magnifier, PersonPlus, Clock } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'
import { MateriaConsultarModal } from './MateriaConsultarModal'
import { MateriaLaboratorioModal } from './MateriaLaboratorioModal'

interface MateriaCardProps {
  materia: Materia
  onSave: (materia: Materia) => void
  onManageTeachers?: (materia: Materia) => void
  onAssignHours?: (materia: Materia) => void
}

export function MateriaCard({
  materia,
  onSave,
  onManageTeachers,
  onAssignHours
}: MateriaCardProps) {
  return (
    <Card className="w-full bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 rounded-xl h-full flex flex-col">

      {/* 1. Header Oficial de HeroUI v3 */}
      <Card.Header className="px-1 pt-0.5 pb-0 flex flex-col items-start gap-1">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Semestre {materia.semestre}
        </span>
        {/* Le quité el text-center y el w-full de aquí para que vuelva a la izquierda */}
        <Card.Title className="text-base font-bold text-slate-800 leading-snug">
          {materia.nombre}
        </Card.Title>
      </Card.Header>

      {/* 2. Content Oficial de HeroUI v3 */}
      <Card.Content className="px-1 flex-1 justify-center">
        {/* Este bloque de secciones sigue centrado */}
        <div className="border-t border-slate-200 pt-4 mt-2 flex flex-col items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
            Secciones
          </label>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9 bg-slate-50/60 w-fit">
            <button
              type="button"
              disabled={materia.nroSecciones <= 0}
              onClick={() => {
                const nuevoNro = Math.max(0, materia.nroSecciones - 1)
                onSave({ ...materia, nroSecciones: nuevoNro }) // 👈 Despacha directo al back
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
              onClick={() => {
                onSave({ ...materia, nroSecciones: materia.nroSecciones + 1 }) // 👈 Despacha directo al back
              }}
              className="px-3 h-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card.Content>

      {/* 3. Footer Oficial de HeroUI v3 */}
      <Card.Footer className="px-1 pb-1 flex flex-col gap-2">

        <div className="grid grid-cols-2 gap-2 w-full">
          <Modal>
            {/* El primer botón dentro del Modal se convierte en el disparador (trigger) automáticamente */}
            <Button
              variant="secondary"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
            >
              <Magnifier className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              Consultar
            </Button>

            {/* El contenido del modal se renderiza aquí */}
            <MateriaConsultarModal
              materia={materia}
              onSave={(materiaActualizada) => { if (onSave) void onSave(materiaActualizada) }}
            />
          </Modal>

          <Button
            variant="secondary"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
            onPress={() => onManageTeachers?.(materia)}
          >
            <PersonPlus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Profesores
          </Button>

          {materia.horasLab > 0 && (
            <Modal>
              <Button
                variant="secondary"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
              >
                <span className="text-[13px] shrink-0">🔬</span>
                Laboratorio
              </Button>
              <MateriaLaboratorioModal
                materia={materia}
                onSave={(materiaActualizada) => { if (onSave) void onSave(materiaActualizada) }}
              />
            </Modal>
          )}

          <Button
            variant="secondary"
            className={`bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2 ${materia.horasLab === 0 ? 'col-span-2' : ''
              }`}
            onPress={() => onAssignHours?.(materia)}
          >
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Asignar Horas
          </Button>
        </div>

      </Card.Footer>
    </Card>
  )
}
