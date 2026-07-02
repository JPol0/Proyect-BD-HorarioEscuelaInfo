import { useState, type FormEvent } from 'react'
import { Calendar } from '@gravity-ui/icons'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Button, Alert } from '@heroui/react'
import { HttpUserRepository } from '../../core/infrastructure/adapters/HttpUserRepository'
import { LoginUser } from '../../core/application/useCases/User/LoginUser'
import { useUser } from '../store/userStore'

export default function LoginPage () {
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { setCurrentUser } = useUser()
  const navigate = useNavigate()

  const performLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const httpRepo = new HttpUserRepository()
      const useCase = new LoginUser(httpRepo)
      const user = await useCase.execute(nombre, password)
      setCurrentUser(user)
      void navigate('/terms', { replace: true })
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: FormEvent) => {
    void performLogin(e)
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-bgmain p-4">
      {/* Círculo/Logo azul superior */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-button-primary rounded-full flex items-center justify-center shadow-md mb-4">
          <Calendar className="text-white w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-titlePage font-sans">
          SGBD HORARIOS
        </h1>
      </div>

      {/* Tarjeta de Login */}
      <Card className="w-full max-w-sm bg-white shadow-xl border border-border px-8 py-10 !rounded-2xl">
        <Card.Content>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error !== null && (
              <Alert color="danger" className="text-xs font-hanken py-2 px-3">
                {error}
              </Alert>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 font-hanken">
                Nombre de usuario
              </label>
              <Input
                value={nombre}
                onChange={(e) => { setNombre(e.target.value) }}
                placeholder="Ingresa tu usuario"
                className="w-full font-hanken"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 font-hanken">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value) }}
                placeholder="Ingresa tu contraseña"
                className="w-full font-hanken"
                required
              />
            </div>

            <Button
              type="submit"
              isDisabled={loading}
              className="w-full bg-button-primary hover:bg-button-primary-hover text-white font-semibold py-3.5 transition-colors font-hanken"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}
