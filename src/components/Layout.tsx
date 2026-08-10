import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Factory,
  LayoutDashboard,
  Menu,
  Percent,
  ShoppingCart,
  Store,
  User,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDate, todayISO } from '../utils/format'

interface NavItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
  exact?: boolean
}

const mainNav: NavItem[] = [
  { label: 'Menu principal', path: '/', icon: LayoutDashboard, exact: true },
  { label: 'Ventas', path: '/ventas', icon: ShoppingCart },
  { label: 'Actualización de precios', path: '/precios', icon: Percent },
  { label: 'Proveedores', path: '/proveedores', icon: Factory },
  { label: 'Reportes', path: '/reportes', icon: BarChart3 },
]

const titles: Array<[RegExp, string]> = [
  [/^\/ventas\/nueva/, 'Nueva venta'],
  [/^\/ventas/, 'Ventas'],
  [/^\/proveedores\//, 'Detalle del proveedor'],
  [/^\/proveedores/, 'Proveedores'],
  [/^\/precios/, 'Actualización de precios'],
  [/^\/reportes/, 'Reportes'],
  [/^\/$/, 'Menu principal'],
]

function pageTitle(pathname: string): string {
  for (const [re, label] of titles) {
    if (re.test(pathname)) return label
  }
  return 'Golosinas del Remate'
}

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.path
  return pathname.startsWith(item.path)
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Menú principal
      </p>
      {mainNav.map((item) => {
        const active = isActive(item, pathname)
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-blue-600 font-medium text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-slate-900 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-slate-900 shadow-2xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <Store className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">Golosinas del Remate</span>
            </div>
            <h1 className="hidden text-base font-semibold text-gray-900 lg:block">
              {pageTitle(location.pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:block">{formatDate(todayISO())}</span>
            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                A
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-medium text-gray-800">Administrador</p>
                <p className="text-[11px] text-gray-500">admin@golosinasdelremate.com.ar</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <footer className="border-t border-gray-200 px-6 py-3 text-center text-xs text-gray-400">
          Golosinas del Remate · Sistema de gestión · Prototipo demostrativo
        </footer>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useApp()
  const location = useLocation()
  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Golosinas del Remate</p>
          <p className="truncate text-xs text-slate-400">Gestión mayorista</p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="ml-auto rounded-md p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <NavList pathname={location.pathname} onNavigate={onNavigate} />

      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-slate-200">
            <User className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">
              {state.settings.user}
            </span>
            <span className="block truncate text-xs text-slate-400">
              {state.settings.businessName}
            </span>
          </span>
        </div>
      </div>
    </>
  )
}
