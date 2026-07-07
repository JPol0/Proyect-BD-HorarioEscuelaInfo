import { useEffect, useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import { Magnifier, Plus, Gear } from '@gravity-ui/icons'

// Core Clean Architecture
import { HttpUserRepository } from '../../core/infrastructure/adapters/HttpUserRepository'
import { GetUsers } from '../../core/application/useCases/User/GetUsers'
import { SaveUser } from '../../core/application/useCases/User/SaveUser'
import { DeleteUser } from '../../core/application/useCases/User/DeleteUser'
import { type User } from '../../core/domain/User'

// Componentes y hooks
import Title from '../components/common/TitlePage'
import UserModal from '../components/UserScreen/UserModal'
import { DeleteConfirmButton } from '../components/common/DeleteConfirmButton'
import { useUser } from '../store/userStore'

const repository = new HttpUserRepository()
const getUsersUseCase = new GetUsers(repository)
const saveUserUseCase = new SaveUser(repository)
const deleteUserUseCase = new DeleteUser(repository)

export function UsuariosPage () {
  const { currentUser } = useUser()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsersUseCase.execute()
      setUsuarios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargarUsuarios()
  }, [])

  const handleCreateUser = async (nombre: string, rol: 'administrador' | 'lector', password?: string) => {
    try {
      await saveUserUseCase.execute({
        id: 0, // El backend mock creará el ID
        nombre,
        rol,
        password
      })
      await cargarUsuarios()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear el usuario')
    }
  }

  const handleUpdateUser = async (userToUpdate: User, nombre: string, rol: 'administrador' | 'lector', password?: string) => {
    try {
      await saveUserUseCase.execute({
        ...userToUpdate,
        nombre,
        rol,
        password: password !== '' ? password : undefined
      })
      await cargarUsuarios()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al modificar el usuario')
    }
  }

  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.nombre === currentUser?.nombre) {
      alert('No puedes eliminar tu propia cuenta de usuario.')
      return
    }

    try {
      await deleteUserUseCase.execute(userToDelete.id)
      await cargarUsuarios()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el usuario')
    }
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Ordenar: Administradores primero, luego lectores. Dentro del rol, ordenar alfabéticamente
  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    if (a.rol === 'administrador' && b.rol !== 'administrador') return -1
    if (a.rol !== 'administrador' && b.rol === 'administrador') return 1
    return a.nombre.localeCompare(b.nombre)
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Title
          title="Gestión de Usuarios"
          subtitle="Administra las cuentas y permisos de los usuarios del sistema."
        />

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-end pb-8">
          {/* Botón Nuevo Usuario */}
          <div className="w-full sm:w-auto flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 invisible sm:inline-block">&nbsp;</span>
            <Modal>
              <Button
                variant="primary"
                className="bg-button-primary hover:bg-button-primary-hover text-white font-semibold text-sm h-9 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Nuevo Usuario
              </Button>
              <UserModal
                user={null}
                onSave={handleCreateUser}
              />
            </Modal>
          </div>

          {/* Buscador */}
          <div className="w-full sm:w-80 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Buscar</span>
            <div className="relative w-full flex items-center">
              <span className="absolute left-3 z-10 pointer-events-none flex items-center">
                <Magnifier className="text-slate-400 w-4 h-4" />
              </span>
              <Input
                type="text"
                placeholder="Buscar usuario por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                variant="primary"
                className="w-full pl-9 pr-3 text-sm h-9 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {loading
        ? (
        <div className="text-center py-12 text-slate-400 font-sans">Cargando lista de usuarios...</div>
          )
        : error
          ? (
        <div className="text-center py-8 text-red-500 bg-red-50 border border-red-200 rounded-xl max-w-xl mx-auto p-4 font-sans">
          {error}
        </div>
            )
          : usuariosOrdenados.length === 0
            ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 font-sans">
          No se encontraron usuarios bajo ese criterio.
        </div>
              )
            : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 border-collapse">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-400 tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosOrdenados.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 capitalize">
                      {user.rol}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                      <Modal>
                        <div title="Modificar Usuario">
                          <Button
                            variant="secondary"
                            className="p-2 h-8 w-8 min-w-0 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center cursor-pointer"
                            aria-label="Modificar Usuario"
                          >
                            <Gear className="w-4 h-4 shrink-0" />
                          </Button>
                        </div>
                        <UserModal
                          user={user}
                          onSave={async (nombre, rol, password) => await handleUpdateUser(user, nombre, rol, password)}
                        />
                      </Modal>

                      {user.nombre !== currentUser?.nombre && (
                        <DeleteConfirmButton
                          title="¿Eliminar Usuario?"
                          description={
                            <span>
                              ¿Estás seguro de que deseas eliminar al usuario <strong>{user.nombre}</strong>? Esta acción no se puede deshacer.
                            </span>
                          }
                          onConfirm={async () => await handleDeleteUser(user)}
                          buttonClassName="p-2 h-8 w-8 min-w-0 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center cursor-pointer border border-red-100/50"
                          ariaLabel="Eliminar Usuario"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
              )}
    </div>
  )
}
