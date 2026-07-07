import { useState } from 'react'
import { Modal, Button, Input, Select, ListBox } from '@heroui/react'
import { type User } from '../../../core/domain/User'

interface UserModalProps {
  user: User | null // null para creación, User para modificación
  onSave: (nombre: string, rol: 'administrador' | 'lector', password?: string) => Promise<void>
}

export default function UserModal ({ user, onSave }: UserModalProps) {
  const [nombre, setNombre] = useState(user?.nombre ?? '')
  const [rol, setRol] = useState<'administrador' | 'lector'>(user?.rol ?? 'lector')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleGuardar = async (close: () => void) => {
    setError(null)
    if (nombre.trim() === '') {
      setError('El nombre de usuario es obligatorio.')
      return
    }

    if (user === null && password.trim() === '') {
      setError('La contraseña es obligatoria para nuevos usuarios.')
      return
    }

    try {
      setCargando(true)
      await onSave(nombre.trim(), rol, password.trim() !== '' ? password.trim() : undefined)
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el usuario.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal.Backdrop className="bg-slate-900/40 backdrop-blur-sm z-50">
      <Modal.Container className="flex items-center justify-center p-4">
        <Modal.Dialog className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-100 animate-fade-in">
          {({ close }) => (
            <>
              {/* Botón X de cierre */}
              <Modal.CloseTrigger className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm" />

              {/* Encabezado del Modal */}
              <Modal.Header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <Modal.Heading className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {user !== null ? 'Modificar Usuario' : 'Nuevo Usuario'}
                </Modal.Heading>
              </Modal.Header>

              {/* Cuerpo del Formulario */}
              <Modal.Body className="px-6 py-5 space-y-4 bg-white">
                {/* Nombre de Usuario */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Nombre de Usuario</span>
                  <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. juan.perez"
                    variant="primary"
                    className="w-full text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Selector de Rol */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Rol del Usuario</span>
                  <Select
                    variant="primary"
                    value={rol}
                    onChange={(valor) => { if (valor) setRol(valor as 'administrador' | 'lector') }}
                    className="w-full text-xs"
                  >
                    <Select.Trigger className="flex justify-between items-center w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-sm text-slate-700 h-9">
                      <Select.Value />
                      <Select.Indicator className="text-slate-400 text-[10px]">▼</Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover placement="bottom start" className="bg-white border border-slate-100 shadow-lg rounded-lg p-1 min-w-45 z-50">
                      <ListBox>
                        <ListBox.Item id="administrador" textValue="Administrador" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                          Administrador
                        </ListBox.Item>
                        <ListBox.Item id="lector" textValue="Lector" className="px-3 py-1.5 text-xs text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer block">
                          Lector
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">
                    Contraseña {user !== null && '(Opcional)'}
                  </span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={user !== null ? 'Dejar en blanco para no modificar' : 'Ingresa la contraseña...'}
                    variant="primary"
                    className="w-full text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Banner de error interno */}
                {error !== null && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-hanken">
                    ⚠️ {error}
                  </p>
                )}
              </Modal.Body>

              {/* Botones de acción inferiores */}
              <Modal.Footer className="px-6 pb-6 pt-4 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/30">
                <Button
                  slot="close"
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs h-9 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  disabled={cargando}
                  className="bg-button-primary hover:bg-button-primary-hover text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  onPress={() => { void handleGuardar(close) }}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
