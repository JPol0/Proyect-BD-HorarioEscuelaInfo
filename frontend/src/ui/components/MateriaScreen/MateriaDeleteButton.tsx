import { DeleteConfirmButton } from '../common/DeleteConfirmButton'
import { type Materia } from '../../../core/domain/Materia'

interface MateriaDeleteButtonProps {
  materia: Materia
  onDelete: (codMateria: string) => void
}

export function MateriaDeleteButton ({ materia, onDelete }: MateriaDeleteButtonProps) {
  return (
    <DeleteConfirmButton
      title="¿Eliminar Materia?"
      description={
        <span>
          ¿Estás seguro de que deseas eliminar la materia <strong>{materia.nombre}</strong>? Esta acción no se puede deshacer.
        </span>
      }
      onConfirm={() => onDelete(materia.codMateria)}
      buttonClassName="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer min-w-0 w-6 h-6 flex items-center justify-center bg-transparent"
      ariaLabel="Eliminar materia"
    />
  )
}
