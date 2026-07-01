import { AlertDialog, Button } from '@heroui/react'
import { TrashBin } from '@gravity-ui/icons'
import { type Materia } from '../../../core/domain/Materia'

interface MateriaDeleteButtonProps {
  materia: Materia
  onDelete: (codMateria: string) => void
}

export function MateriaDeleteButton ({ materia, onDelete }: MateriaDeleteButtonProps) {
  return (
    <AlertDialog>
      <Button
        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer min-w-0 w-6 h-6 flex items-center justify-center bg-transparent"
        aria-label="Eliminar materia"
      >
        <TrashBin className="w-3.5 h-3.5" />
      </Button>
      <AlertDialog.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
        <AlertDialog.Container className="flex items-center justify-center p-4">
          <AlertDialog.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100 p-6 space-y-4">
            {({ close }) => (
              <>
                <AlertDialog.Header>
                  <AlertDialog.Heading className="text-lg font-bold text-slate-800">
                    ¿Eliminar Materia?
                  </AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body className="text-sm text-slate-500">
                  ¿Estás seguro de que deseas eliminar la materia <strong>{materia.nombre}</strong>? Esta acción no se puede deshacer.
                </AlertDialog.Body>
                <AlertDialog.Footer className="flex justify-end gap-3 pt-2">
                  <Button
                    slot="close"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer"
                    onPress={() => {
                      onDelete(materia.codMateria)
                      close()
                    }}
                  >
                    Eliminar
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
