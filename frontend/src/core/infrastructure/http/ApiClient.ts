const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor (public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  async get<T> (path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`)

    if (!response.ok) {
      throw new ApiError(response.status, 'Error al obtener datos')
    }

    return await response.json() as T
  }

  async put<T> (path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: 'Error al guardar' }))
      throw new ApiError(response.status, payload.message as string)
    }

    return await response.json() as T
  }
}
