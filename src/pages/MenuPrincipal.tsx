import { Link } from 'react-router-dom'
import { BarChart3, Factory, Percent, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatNumber, todayISO } from '../utils/format'

const quickActions = [
  {
    title: 'Nueva venta',
    description: 'Registrar una venta al momento',
    path: '/ventas/nueva',
    icon: ShoppingCart,
  },
  {
    title: 'Actualización de precios',
    description: 'Ajustar precios por proveedor',
    path: '/precios',
    icon: Percent,
  },
  {
    title: 'Proveedores',
    description: 'Administrar proveedores del catálogo',
    path: '/proveedores',
    icon: Factory,
  },
  {
    title: 'Reportes',
    description: 'Consultar ventas y productos más vendidos',
    path: '/reportes',
    icon: BarChart3,
  },
]

export default function MenuPrincipal() {
  const { state } = useApp()
  const today = todayISO()
  const salesToday = state.sales.filter((s) => s.date === today && s.status === 'Completada')

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-ink-on-dark)]">
          Hola, Administrador
        </h1>
        <p className="text-sm text-[var(--color-dim-on-dark)]">¿Qué desea hacer hoy?</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.25)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--color-mute-on-dark)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
              <item.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[var(--color-ink-on-dark)]">{item.title}</p>
            <p className="mt-0.5 text-xs text-[var(--color-dim-on-dark)]">{item.description}</p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-[var(--color-dim-on-dark)]">
        Ventas de hoy: <span className="font-medium text-[var(--color-ink-on-dark)]">{formatNumber(salesToday.length)}</span>
      </p>
    </div>
  )
}
