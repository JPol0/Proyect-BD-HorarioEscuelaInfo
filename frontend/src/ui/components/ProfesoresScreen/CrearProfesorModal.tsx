import { useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import type { Profesor } from '../../../core/domain/Profesor'
import { HttpProfesorRepository } from '../../../core/infrastructure/adapters/HttpProfesorRepository'

interface CrearProfesorModalProps {
  onCreado: (profesor: Profesor) => void
}

const repository = new HttpProfesorRepository()

export function CrearProfesorModal ({ onCreado }: CrearProfesorModalProps) {
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const CEDULA_REGEX = /^[VEve]-\d{6,8}$/
  const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{3,}$/

  const handleGuardar = async (close: () => void) => {
    setError(null)

    if (cedula.trim() === '' || nombre.trim() === '') {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (!CEDULA_REGEX.test(cedula.trim())) {
      setError('La cédula debe tener el formato V-1234567 o E-1234567 (6 a 8 dígitos).')
      return
    }
    if (!NOMBRE_REGEX.test(nombre.trim())) {
      setError('El nombre debe tener al menos 3 caracteres y solo puede contener letras y espacios.')
      return
    }

    try {
      setGuardando(true)
      const nuevo = await repository.crearProfesor({
        cedula: cedula.trim().toUpperCase(),
        nombre: nombre.trim(),
        status: 'A'
      })
      onCreado(nuevo)
      setCedula('')
      setNombre('')
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el profesor')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-5 right-5 text-text-muted hover:text-text-secondary cursor-pointer" />

              <Modal.Header className="px-6 pt-6 pb-4 border-b border-border bg-surface-alt">
                <Modal.Heading className="text-lg font-bold text-titlePage">
                  Añadir Profesor
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="px-6 py-5 space-y-4 bg-surface">
                {error != null && (
                  <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">⚠️ {error}</p>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-subtitlePage uppercase tracking-wider">Cédula</label>
                  <Input
                    type="text"
                    placeholder="Ej: V-12345678"
                    value={cedula}
                    onChange={(e) => { setCedula(e.target.value) }}
                    variant="primary"
                    className="w-full text-sm h-9 border border-border rounded-lg bg-surface-alt"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-subtitlePage uppercase tracking-wider">Nombre completo</label>
                  <Input
                    type="text"
                    placeholder="Ej: María López"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value) }}
                    variant="primary"
                    className="w-full text-sm h-9 border border-border rounded-lg bg-surface-alt"
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-3">
                <Button
                  variant="secondary"
                  className="bg-surface-alt hover:bg-border text-text-secondary text-xs px-5 h-9 cursor-pointer"
                  onPress={close}
                  isDisabled={guardando}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="bg-button-primary hover:bg-button-primary-hover text-white text-xs px-5 h-9 cursor-pointer"
                  onPress={() => { void handleGuardar(close) }}
                  isDisabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Crear Profesor'}
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
