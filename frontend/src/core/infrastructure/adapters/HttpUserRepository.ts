import { type UserRepository } from '../../application/ports/UserRepository'
import { type User } from '../../domain/User'
import { API_CONFIG } from '../config/api'

export class HttpUserRepository implements UserRepository {
  private readonly apiUrl = `${API_CONFIG.BASE_URL}/auth/login`

  async login (nombre: string, password: string): Promise<User> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, password })
    })

    if (!response.ok) {
      let errorMessage = 'Error al iniciar sesión'
      try {
        const errorData = await response.json() as Record<string, unknown>
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {}
      throw new Error(errorMessage)
    }

    return await response.json() as User
  }
}
