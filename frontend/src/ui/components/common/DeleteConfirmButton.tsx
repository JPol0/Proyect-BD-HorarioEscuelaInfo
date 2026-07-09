import { AlertDialog, Button } from '@heroui/react'
import { TrashBin } from '@gravity-ui/icons'
import { type ReactNode } from 'react'

interface DeleteConfirmButtonProps {
  title: string
  description: ReactNode
  onConfirm: () => void | Promise<void>
  buttonClassName?: string
  ariaLabel?: string
}

export function DeleteConfirmButton ({
  title,
  description,
  onConfirm,
  buttonClassName = 'p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer min-w-0 w-6 h-6 flex items-center justify-center bg-transparent',
  ariaLabel = 'Eliminar'
}: DeleteConfirmButtonProps) {
  return (
    <AlertDialog>
      <div title={ariaLabel} className="inline-block">
        <Button
          className={buttonClassName}
          aria-label={ariaLabel}
        >
          <TrashBin className="w-3.5 h-3.5" />
        </Button>
      </div>
      <AlertDialog.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
        <AlertDialog.Container className="flex items-center justify-center p-4">
          <AlertDialog.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100 p-6 space-y-4">
            {({ close }) => (
              <>
                <AlertDialog.Header>
                  <AlertDialog.Heading className="text-lg font-bold text-slate-800">
                    {title}
                  </AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body className="text-sm text-slate-500">
                  {description}
                </AlertDialog.Body>
                <AlertDialog.Footer className="flex justify-end gap-3 pt-2">
                  <Button
                    slot="close"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer animate-fade-in"
                    onPress={() => {
                      void onConfirm()
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
