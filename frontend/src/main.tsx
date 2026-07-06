import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Interceptor global de Fetch para añadir la cabecera de rol del usuario y el token de autorización
const originalFetch = window.fetch
window.fetch = async (input, init) => {
  const headers = new Headers(init?.headers)

  try {
    const rawUser = localStorage.getItem('currentUser')
    if (rawUser !== null) {
      const user = JSON.parse(rawUser) as { rol?: string, token?: string }
      if (user !== null) {
        if (typeof user.rol === 'string') {
          headers.set('x-user-role', user.rol)
        }
        if (typeof user.token === 'string') {
          headers.set('Authorization', `Bearer ${user.token}`)
        }
      }
    }
  } catch (error) {
    console.error('Error al parsear el usuario en el interceptor fetch:', error)
  }

  return await originalFetch(input, {
    ...init,
    headers
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
