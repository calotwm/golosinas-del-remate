import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calendar, ChevronRight, PackageCheck, Receipt, ShoppingCart, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, StatCard, Table, TBody, Td, Th, THead } from '../components/ui'
import { formatARS, formatDate, round2, todayISO } from '../utils/format'
import {
  bucketByDay,
  lastNDays,
  sumQuantity,
  sumTotals,
  totalsByProduct,
  totalsByProvider,
} from '../utils/analytics'

const PALETTE = ['#2563eb', '#7c3aed', '#0d9488', '#ea580c', '#dc2626', '#059669', '#ca8a04', '#db2777']

export default function Dashboard() {
  const { state } = useApp()
  const { sales, clients, products, providers } = state
  const today = todayISO()
  const startWeek = lastNDays(today, 7)[0]
  const monthStart = `${today.slice(0, 8)}01`

  const salesToday = sales.filter((s) => s.date === today && s.status === 'Completada')
  const salesWeek = sales.filter((s) => s.date >= startWeek && s.date <= today && s.status === 'Completada')
  const salesMonth = sales.filter((s) => s.date >= monthStart && s.date <= today && s.status === 'Completada')

  const last7 = bucketByDay(sales, lastNDays(today, 7)[0], today)
  const topProducts = totalsByProduct(sales).slice(0, 8)
  const byProvider = totalsByProvider(sales, products, providers).slice(0, 6)

  const clientOf = new Map(clients.map((c) => [c.id, c.name]))
  const recent = [...sales]
    .sort((a, b) => (a.date === b.date ? b.number - a.number : a.date < b.date ? 1 : -1))
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Ventas del día"
          value={salesToday.length}
          icon={<ShoppingCart className="h-5 w-5" />}
          sub={`${state.settings.user} · ${formatDate(today)}`}
        />
        <StatCard
          label="Facturación del día"
          value={formatARS(sumTotals(salesToday))}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Productos vendidos"
          value={sumQuantity(salesToday)}
          icon={<PackageCheck className="h-5 w-5" />}
          sub="unidades vendidas hoy"
        />
        <StatCard
          label="Ventas de la semana"
          value={salesWeek.length}
          icon={<Calendar className="h-5 w-5" />}
          sub={`${formatARS(sumTotals(salesWeek))} facturados en 7 días`}
        />
        <StatCard
          label="Ventas del mes"
          value={salesMonth.length}
          icon={<Receipt className="h-5 w-5" />}
          sub={`${formatARS(sumTotals(salesMonth))} facturados en el mes`}
        />
        <StatCard
          label="Ticket promedio"
          value={salesWeek.length ? formatARS(round2(sumTotals(salesWeek) / salesWeek.length)) : '$0'}
          icon={<Receipt className="h-5 w-5" />}
          sub="valor promedio por venta"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card title="Ventas de los últimos 7 días" className="xl:col-span-3">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  formatter={(value) => formatARS(Number(value))}
                  labelStyle={{ fontWeight: 600, color: '#111827' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Facturación"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#gradSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Productos más vendidos" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts.map((p) => ({ name: p.label, Cantidad: p.qty }))}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => `${value} unidades`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                />
                <Bar dataKey="Cantidad" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card title="Ventas por proveedor" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProvider} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  formatter={(value) => formatARS(Number(value))}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                />
                <Bar dataKey="total" name="Ventas" radius={[4, 4, 0, 0]} barSize={28}>
                  {byProvider.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Últimas ventas"
          className="xl:col-span-3"
          actions={
            <Link
              to="/ventas"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver historial <ChevronRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="-m-5">
            <Table>
              <THead>
                <Th>Número</Th>
                <Th>Cliente</Th>
                <Th className="text-right">Total</Th>
                <Th>Forma de pago</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
              </THead>
              <TBody>
                {recent.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50">
                    <Td className="font-medium text-gray-800">Venta #{s.number}</Td>
                    <Td>{clientOf.get(s.clientId) ?? 'Cliente eliminado'}</Td>
                    <Td className="text-right font-medium tabular-nums text-gray-800">{formatARS(s.total)}</Td>
                    <Td>{s.paymentMethod}</Td>
                    <Td>{formatDate(s.date)}</Td>
                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          s.status === 'Completada'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-gray-100 text-gray-600 ring-gray-500/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  )
}
