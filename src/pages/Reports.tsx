import { useMemo, useState } from 'react'
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
import type { NamedTotal } from '../utils/analytics'
import { useApp } from '../context/AppContext'
import { Button, Card, EmptyState, Field, Input, Table, TBody, Td, Th, THead } from '../components/ui'
import { formatARS, formatNumber, round2, todayISO } from '../utils/format'
import {
  bucketByDay,
  bucketByMonth,
  bucketByWeek,
  lastNDays,
  salesInRange,
  sumQuantity,
  sumTotals,
  totalsByClient,
  totalsByProduct,
  totalsByProvider,
} from '../utils/analytics'

type ReportKey =
  | 'diarias'
  | 'semanales'
  | 'mensuales'
  | 'por-cliente'
  | 'por-producto'
  | 'por-proveedor'
  | 'mas-vendidos'
  | 'facturacion'

const REPORTS: Array<{ key: ReportKey; label: string }> = [
  { key: 'diarias', label: 'Ventas diarias' },
  { key: 'semanales', label: 'Ventas semanales' },
  { key: 'mensuales', label: 'Ventas mensuales' },
  { key: 'por-cliente', label: 'Ventas por cliente' },
  { key: 'por-producto', label: 'Ventas por producto' },
  { key: 'por-proveedor', label: 'Ventas por proveedor' },
  { key: 'mas-vendidos', label: 'Productos más vendidos' },
  { key: 'facturacion', label: 'Facturación por período' },
]

const PALETTE = ['#2563eb', '#7c3aed', '#0d9488', '#ea580c', '#dc2626', '#059669', '#ca8a04', '#db2777']

interface Row {
  key: string
  label: string
  total: number
  count: number
  qty: number
}

type Column = 'label' | 'count' | 'qty' | 'total'

const toRow = (t: NamedTotal): Row => ({ key: t.key, label: t.label, total: t.total, count: t.count, qty: t.qty })
const toBucketRow = (b: { key: string; label: string; total: number; count: number }): Row => ({
  key: b.key,
  label: b.label,
  total: b.total,
  count: b.count,
  qty: 0,
})

export default function Reports() {
  const { state } = useApp()
  const { sales, clients, products, providers } = state

  const today = todayISO()
  const [report, setReport] = useState<ReportKey>('diarias')
  const [from, setFrom] = useState(lastNDays(today, 30)[0])
  const [to, setTo] = useState(today)

  const inRange = useMemo(() => salesInRange(sales, from, to), [sales, from, to])

  const data = useMemo<{ rows: Row[]; columns: Column[]; chart: 'area' | 'bar' | 'hbar' }>(() => {
    const valid = from <= to
    if (!valid) return { rows: [], columns: ['label'], chart: 'area' }

    switch (report) {
      case 'diarias':
        return {
          rows: bucketByDay(sales, from, to).map(toBucketRow),
          columns: ['label', 'count', 'total'],
          chart: 'area',
        }
      case 'semanales':
        return {
          rows: bucketByWeek(sales, from, to).map(toBucketRow),
          columns: ['label', 'count', 'total'],
          chart: 'area',
        }
      case 'mensuales':
        return {
          rows: bucketByMonth(sales, from, to).map(toBucketRow),
          columns: ['label', 'count', 'total'],
          chart: 'area',
        }
      case 'por-cliente':
        return {
          rows: totalsByClient(inRange, clients).map(toRow),
          columns: ['label', 'count', 'qty', 'total'],
          chart: 'bar',
        }
      case 'por-producto':
        return {
          rows: totalsByProduct(inRange).map(toRow),
          columns: ['label', 'count', 'qty', 'total'],
          chart: 'bar',
        }
      case 'por-proveedor':
        return {
          rows: totalsByProvider(inRange, products, providers).map(toRow),
          columns: ['label', 'count', 'qty', 'total'],
          chart: 'bar',
        }
      case 'mas-vendidos':
        return {
          rows: totalsByProduct(inRange)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 12)
            .map(toRow),
          columns: ['label', 'qty', 'total'],
          chart: 'hbar',
        }
      case 'facturacion':
        return {
          rows: bucketByDay(sales, from, to).map(toBucketRow),
          columns: ['label', 'count', 'total'],
          chart: 'area',
        }
    }
  }, [report, from, to, sales, clients, products, providers, inRange])

  const totals = useMemo(() => {
    const total = sumTotals(inRange)
    const count = inRange.length
    return {
      total,
      count,
      avg: count ? round2(total / count) : 0,
      qty: sumQuantity(inRange),
    }
  }, [inRange])

  const chartData = data.rows.map((r) => ({ label: r.label, total: r.total, count: r.count, qty: r.qty }))
  const maxLabel = Math.max(...data.rows.map((r) => r.label.length), 10)

  const invalidRange = from > to

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {REPORTS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setReport(r.key)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  report === r.key
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-3">
            <Field label="Desde">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Hasta">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <Button
              variant="secondary"
              onClick={() => {
                setFrom(lastNDays(today, 30)[0])
                setTo(today)
              }}
            >
              Últimos 30 días
            </Button>
          </div>
        </div>
        {invalidRange && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            La fecha "desde" no puede ser posterior a la fecha "hasta".
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Ventas en el período" value={formatNumber(totals.count)} />
        <SummaryTile label="Facturación del período" value={formatARS(totals.total)} />
        <SummaryTile label="Ticket promedio" value={formatARS(totals.avg)} />
        <SummaryTile label="Unidades vendidas" value={formatNumber(totals.qty)} />
      </div>

      {report === 'facturacion' && (
        <Card title="Resumen de facturación">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total facturado</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{formatARS(totals.total)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ventas registradas</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{formatNumber(totals.count)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Días con ventas</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatNumber(data.rows.filter((r) => r.count > 0).length)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title={REPORTS.find((r) => r.key === report)?.label}>
        {invalidRange || data.rows.length === 0 ? (
          <EmptyState
            title="No hay datos en el período seleccionado"
            description="Ajuste el rango de fechas para visualizar el reporte."
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {data.chart === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={85} />
                    <Tooltip
                      formatter={(value) => formatARS(Number(value))}
                      labelStyle={{ fontWeight: 600, color: '#111827' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Area type="monotone" dataKey="total" name="Facturación" stroke="#2563eb" strokeWidth={2} fill="url(#reportGrad)" />
                  </AreaChart>
                ) : data.chart === 'hbar' ? (
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="label" width={Math.min(220, maxLabel * 8)} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => `${formatNumber(Number(value))} unidades`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Bar dataKey="qty" name="Unidades" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={85} />
                    <Tooltip
                      formatter={(value) => formatARS(Number(value))}
                      labelStyle={{ fontWeight: 600, color: '#111827' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Bar dataKey="total" name="Facturación" radius={[4, 4, 0, 0]} barSize={26}>
                      {data.rows.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <Table>
              <THead>
                <Th>{columnTitle(data.columns[0])}</Th>
                {data.columns.includes('count') && <Th className="text-right">Ventas</Th>}
                {data.columns.includes('qty') && <Th className="text-right">Unidades</Th>}
                <Th className="text-right">Facturación</Th>
              </THead>
              <TBody>
                {data.rows.map((r) => (
                  <tr key={r.key} className="hover:bg-gray-50">
                    <Td className="font-medium text-gray-800">{r.label}</Td>
                    {data.columns.includes('count') && <Td className="text-right tabular-nums">{formatNumber(r.count)}</Td>}
                    {data.columns.includes('qty') && <Td className="text-right tabular-nums">{formatNumber(r.qty)}</Td>}
                    <Td className="text-right font-medium tabular-nums text-gray-800">{formatARS(r.total)}</Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

function columnTitle(key: Column): string {
  switch (key) {
    case 'count':
      return 'Ventas'
    case 'qty':
      return 'Unidades'
    case 'total':
      return 'Facturación'
    default:
      return 'Período / Concepto'
  }
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold tabular-nums text-gray-900">{value}</p>
    </div>
  )
}
