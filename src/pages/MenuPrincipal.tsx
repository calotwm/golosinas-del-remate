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
        <h1 className="text-2xl font-semibold text-gray-900">Hola, Administrador</h1>
        <p className="text-sm text-gray-500">¿Qué desea hacer hoy?</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <item.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-gray-800">{item.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Ventas de hoy: <span className="font-medium text-gray-800">{formatNumber(salesToday.length)}</span>
      </p>
    </div>
  )
}
