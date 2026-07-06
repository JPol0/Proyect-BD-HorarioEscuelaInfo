import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import { useUserStore } from './ui/store/userStore.ts'

// Interceptor global de Fetch para habilitar el envío automático de cookies y manejar expiración de sesión
const originalFetch = window.fetch
window.fetch = async (input, init) => {
  const response = await originalFetch(input, {
    ...init,
    credentials: 'include' // Habilita el envío automático de cookies en peticiones cruzadas (CORS)
  })

  // Si el servidor retorna 401 o 403 (sesión inválida o expirada), deslogueamos automáticamente
  if (response.status === 401 || response.status === 403) {
    useUserStore.getState().clearCurrentUser()
  }

  return response
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
