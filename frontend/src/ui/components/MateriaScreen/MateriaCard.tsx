import { Card, Button } from '@heroui/react'
import { Minus, Plus, Pencil, PersonPlus, Clock } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'

interface MateriaCardProps {
  materia: Materia
  onUpdateSecciones: (codMateria: string, delta: number) => void
  onSave?: (materia: Materia) => void
  onEdit?: (materia: Materia) => void
  onManageTeachers?: (materia: Materia) => void
  onAssignHours?: (materia: Materia) => void
}

export function MateriaCard ({
  materia,
  onUpdateSecciones,
  onSave,
  onEdit,
  onManageTeachers,
  onAssignHours
}: MateriaCardProps) {
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(materia)
    } else if (onSave) {
      onSave(materia)
    }
  }

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
              onClick={() => onUpdateSecciones(materia.codMateria, -1)}
              className="px-3 h-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="px-4 text-sm font-semibold text-slate-700 border-x border-slate-200/60 min-w-9 text-center select-none">
              {materia.nroSecciones}
            </span>

            <button
              type="button"
              onClick={() => onUpdateSecciones(materia.codMateria, 1)}
              className="px-3 h-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card.Content>

      {/* 3. Footer Oficial de HeroUI v3 */}
      <Card.Footer className="px-1 pb-1 flex flex-col gap-2">

        {/* Botones Secundarios: Iconos pasados directamente como children */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="secondary"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
            onPress={handleEditClick}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Editar
          </Button>

          <Button
            variant="secondary"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs h-9 cursor-pointer w-full flex items-center justify-center gap-2"
            onPress={() => onManageTeachers?.(materia)}
          >
            <PersonPlus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Profesores
          </Button>
        </div>

        {/* Botón Principal */}
        <Button
          variant="primary"
          className="bg-button-primary hover:bg-button-primary-hover text-white font-medium text-xs h-9 shadow-sm cursor-pointer w-full flex items-center justify-center gap-2"
          onPress={() => onAssignHours?.(materia)}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Asignar Horas
        </Button>

      </Card.Footer>
    </Card>
  )
}
