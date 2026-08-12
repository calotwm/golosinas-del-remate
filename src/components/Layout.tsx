import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Factory, LayoutDashboard, Menu, Percent, ShoppingCart, X } from 'lucide-react'
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
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-dim)]">
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
            className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-ink)] hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-ink)]'
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
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[var(--color-scrim)]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--color-surface-deep)]">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-hairline-dark)] bg-[var(--color-canvas)] px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full p-2 text-[var(--color-ink-dim)] hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-ink)] lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-[var(--font-display)] text-xl tracking-tight text-[var(--color-ink)]">
              {pageTitle(location.pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--color-ink-dim)] sm:block">
              {formatDate(todayISO())}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-3 py-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                A
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-medium text-[var(--color-ink)]">Administrador</p>
                <p className="text-[11px] text-[var(--color-ink-dim)]">admin@golosinasdelremate.com.ar</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>

        <footer className="shrink-0 bg-[var(--color-primary)] px-6 py-3 text-center text-xs font-medium text-white">
          Golosinas del Remate · Sistema de gestión · Prototipo demostrativo
        </footer>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useApp()
  const location = useLocation()
  const initials = state.settings.user.trim().charAt(0).toUpperCase() || 'A'
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-[var(--color-hairline-dark)] px-6">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
        <span className="truncate font-[var(--font-display)] text-base font-normal tracking-wide text-[var(--color-ink)]">
          Golosinas del <span className="text-[var(--color-primary)]">Remate</span>
        </span>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="ml-auto rounded-full p-1 text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <NavList pathname={location.pathname} onNavigate={onNavigate} />

      <div className="shrink-0 border-t border-[var(--color-hairline-dark)] px-4 py-3">
        <div className="flex items-center gap-3 rounded-full px-2 py-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[var(--color-ink)]">
              {state.settings.user}
            </span>
            <span className="block truncate text-xs text-[var(--color-ink-dim)]">
              {state.settings.businessName}
            </span>
          </span>
        </div>
      </div>
    </>
  )
}
