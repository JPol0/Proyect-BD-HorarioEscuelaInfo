import type { JSX } from 'react'

interface SidebarItem {
  label: string
  active?: boolean
}

const ITEMS: SidebarItem[] = [
  { label: 'Materias' },
  { label: 'Profesores', active: true },
  { label: 'Laboratorios' },
  { label: 'Generar Horario' },
  { label: 'Peligros' },
  { label: 'Seleccionar Term' }
]

export function Sidebar (): JSX.Element {
  return (
    <aside className="flex h-full min-h-screen w-72 flex-col bg-[#0F1F3D] p-6 text-white">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">SGBD HORARIOS</h2>
        <p className="mt-2 text-sm text-slate-300">Universidad Católica Andrés Bello / Semestre 2026-15</p>
      </div>
      <nav className="space-y-2">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`w-full rounded-lg px-4 py-3 text-left text-sm transition ${item.active ? 'bg-[#2C7A9E] font-semibold' : 'hover:bg-slate-800'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
