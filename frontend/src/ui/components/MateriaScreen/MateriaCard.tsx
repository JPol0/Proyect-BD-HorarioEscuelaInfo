import { Card, Button } from '@heroui/react'
import { Plus, Minus } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'

interface MateriaCardProps {
  materia: Materia
  onUpdateSecciones: (codMateria: string, delta: number) => void
  onSave: (materia: Materia) => Promise<void>
}

export function MateriaCard ({ materia, onUpdateSecciones, onSave }: MateriaCardProps) {
  return (
    <Card variant="default" className="shadow-sm">
      {/* Nueva API: Card.Content como contenedor principal */}
      <Card.Content className="p-5 flex flex-col justify-between h-48">
        <div>
          <h3 className="text-xl font-bold text-slate-800 font-hanken line-clamp-2">
            {materia.nombre}
          </h3>
          <span className="text-xs text-slate-400 font-mono block mt-1">
            {materia.codMateria} · Semestre {materia.semestre}
          </span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Secciones
            </span>
            <div className="flex items-center gap-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="h-7 w-7 min-w-7 rounded-md text-slate-500 hover:text-slate-800 flex items-center justify-center"
                onPress={() => onUpdateSecciones(materia.codMateria, -1)}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>

              <span className="font-semibold text-slate-700 min-w-4 text-center text-sm">
                {materia.nroSecciones}
              </span>

              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="h-7 w-7 min-w-7 rounded-md text-slate-500 hover:text-slate-800 flex items-center justify-center"
                onPress={() => onUpdateSecciones(materia.codMateria, 1)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="bg-[#1A5F7A] text-white font-medium shadow-sm px-4 h-9 rounded-lg transition-transform active:scale-95"
            onPress={() => { void onSave(materia) }}
          >
            Asignar Horas
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
