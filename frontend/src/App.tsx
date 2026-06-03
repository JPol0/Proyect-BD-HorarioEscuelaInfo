import AlarmCenter from './ui/pages/AlarmCenter'

function App () {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR TEMPORAL: Ocupa ancho fijo y simula el diseño oscuro */}
      <aside className="w-72 bg-[#0B132B] text-white p-6 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Encabezado del Sistema */}
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-wide">SGBD HORARIOS</h2>
            <p className="text-xs text-slate-400 mt-1">Universidad Católica Andrés Bello</p>
            <p className="text-xs text-slate-400">Semestre 2026-15</p>
          </div>

          {/* Lista de navegación simulada en texto plano */}
          <nav className="space-y-1">
            <div className="px-3 py-2 text-sm text-slate-400">📓 Materias</div>
            <div className="px-3 py-2 text-sm text-slate-400">🎓 Profesores</div>
            <div className="px-3 py-2 text-sm text-slate-400">🔬 Laboratorios</div>
            <div className="px-3 py-2 text-sm text-slate-400">📅 Generar Horarios</div>
            {/* Opción activa según la foto */}
            <div className="px-3 py-2 text-sm bg-[#1A5F7A] text-white rounded font-medium">⚠️ Peligros</div>
            <div className="px-3 py-2 text-sm text-slate-400">🗓️ Seleccionar Term</div>
          </nav>
        </div>

        {/* Zona inferior (puedes dejar un aviso de que es temporal) */}
        <div className="pt-4 border-t border-slate-800 text-xs text-center text-slate-500 italic">
          [ Sidebar Temporal - En Desarrollo ]
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL: Aquí se renderiza tu centro de alarmas */}
      <main className="flex-1 p-10 overflow-y-auto bg-bgmain">
        <AlarmCenter />
      </main>
    </div>
  )
}

export default App
