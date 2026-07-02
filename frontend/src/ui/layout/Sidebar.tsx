import { useState, type JSX, type SVGProps, type ComponentType } from 'react'
import {
  Book,
  GraduationCap,
  Flask,
  Calendar,
  TriangleExclamation,
  LayoutHeaderSideContent
} from '@gravity-ui/icons'

interface SidebarItem {
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const ITEMS: SidebarItem[] = [
  { label: 'Materias', Icon: Book },
  { label: 'Profesores', Icon: GraduationCap },
  { label: 'Laboratorios', Icon: Flask },
  { label: 'Generar Horario', Icon: Calendar },
  { label: 'Peligros', Icon: TriangleExclamation },
  { label: 'Seleccionar Term', Icon: LayoutHeaderSideContent }
]

export function Sidebar (): JSX.Element {
  const [activeItem, setActiveItem] = useState<string>('Seleccionar Term')

  return (
    <aside className="flex h-full min-h-screen w-72 flex-col bg-sidebar py-8 text-white">
      <div className="mb-8 px-6">
        <h2 className="text-2xl font-bold tracking-wide text-white">SGBD HORARIOS</h2>
        <p className="mt-2 text-xs text-slate-400">
          Universidad Católica Andrés Bello
        </p>
        <p className="mt-3.5 text-sm font-bold tracking-wide text-[#57a8c8]">
          Semestre 2026-15
        </p>
      </div>
      <nav className="space-y-1">
        {ITEMS.map((item) => {
          const isActive = activeItem === item.label
          const Icon = item.Icon
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => { setActiveItem(item.label) }}
              className={`flex w-full items-center gap-4 px-6 py-3.5 text-left text-sm transition-all duration-200 !rounded-none ${isActive
                ? 'bg-button-primary font-medium text-white shadow-sm'
                : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
