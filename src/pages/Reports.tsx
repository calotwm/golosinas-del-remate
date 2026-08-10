import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../context/AppContext'
import { Card, EmptyState, Field, Input, Table, TBody, Td, Th, THead } from '../components/ui'
import { formatARS, formatDate, formatNumber, todayISO } from '../utils/format'
import { bucketByDay, lastNDays, salesInRange, sumTotals, totalsByProduct } from '../utils/analytics'

type ReportTab = 'ventas' | 'top-productos'

const TABS: Array<{ key: ReportTab; label: string }> = [
  { key: 'ventas', label: 'Ventas' },
  { key: 'top-productos', label: 'Productos más vendidos' },
]

const GRID = '#26262a'
const AXIS_TICK = { fontSize: 12, fill: 'rgba(255,255,255,0.45)' }
const AXIS_TICK_SM = { fontSize: 11, fill: 'rgba(255,255,255,0.45)' }
const TOOLTIP_STYLE = {
  backgroundColor: '#16181a',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 13,
}
const TOOLTIP_CURSOR = { fill: 'rgba(255,255,255,0.06)' }

export default function Reports() {
  const { state } = useApp()
  const { sales, products, providers } = state

  const today = todayISO()
  const [tab, setTab] = useState<ReportTab>('ventas')
  const [from, setFrom] = useState(lastNDays(today, 7)[0])
  const [to, setTo] = useState(today)

  const invalidRange = from > to
  const inRange = useMemo(
    () => (invalidRange ? [] : salesInRange(sales, from, to)),
    [sales, from, to, invalidRange],
  )

  const providerOf = new Map(products.map((p) => [p.id, p.providerId]))
  const providerName = new Map(providers.map((p) => [p.id, p.name]))

  const dailyTotals = useMemo(
    () => (invalidRange ? [] : bucketByDay(sales, from, to)),
    [sales, from, to, invalidRange],
  )

  const topProducts = useMemo(
    () =>
      totalsByProduct(inRange)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 8),
    [inRange],
  )

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex rounded-full border border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-[var(--color-primary)] text-[var(--color-ink-on-dark)]'
                    : 'text-[var(--color-mute-on-dark)] hover:text-[var(--color-ink-on-dark)]'
                }`}
              >
                {t.label}
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
          </div>
        </div>
      </Card>

      {tab === 'ventas' ? (
        <>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-4 py-3">
              Ventas en el período:{' '}
              <span className="font-[var(--font-display)] font-medium tabular-nums text-[var(--color-ink-on-dark)]">{formatNumber(inRange.length)}</span>
            </span>
            <span className="rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-4 py-3">
              Facturación:{' '}
              <span className="font-[var(--font-display)] font-medium tabular-nums text-[var(--color-ink-on-dark)]">{formatARS(sumTotals(inRange))}</span>
            </span>
          </div>

          <Card title="Facturación por día">
            {invalidRange ? (
              <EmptyState
                title="Rango de fechas inválido"
                description="La fecha 'desde' no puede ser posterior a la fecha 'hasta'."
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTotals} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                      formatter={(value) => formatARS(Number(value))}
                      contentStyle={TOOLTIP_STYLE}
                      cursor={TOOLTIP_CURSOR}
                    />
                    <Bar dataKey="total" name="Facturación" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Ventas del período">
            {inRange.length === 0 ? (
              <EmptyState
                title="No hay ventas en el período seleccionado"
                description="Ajuste el rango de fechas para visualizar las ventas."
              />
            ) : (
              <Table>
                <THead>
                  <Th>Número</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Productos</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Forma de pago</Th>
                </THead>
                <TBody>
                  {[...inRange]
                    .sort((a, b) => (a.date === b.date ? b.number - a.number : a.date < b.date ? 1 : -1))
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.03]">
                        <Td className="font-medium text-[var(--color-ink-on-dark)]">#{s.number}</Td>
                        <Td>{formatDate(s.date)}</Td>
                        <Td className="text-right tabular-nums">
                          {formatNumber(s.items.reduce((acc, it) => acc + it.quantity, 0))}
                        </Td>
                        <Td className="text-right font-medium tabular-nums text-[var(--color-ink-on-dark)]">{formatARS(s.total)}</Td>
                        <Td>{s.paymentMethod}</Td>
                      </tr>
                    ))}
                </TBody>
              </Table>
            )}
          </Card>
        </>
      ) : (
        <Card title="Productos más vendidos">
          {topProducts.length === 0 ? (
            <EmptyState
              title="No hay datos en el período seleccionado"
              description="Ajuste el rango de fechas para visualizar el reporte."
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts.map((p) => ({ name: p.label, Cantidad: p.qty }))}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK_SM} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={AXIS_TICK_SM}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => `${formatNumber(Number(value))} unidades`}
                      contentStyle={TOOLTIP_STYLE}
                      cursor={TOOLTIP_CURSOR}
                    />
                    <Bar dataKey="Cantidad" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <THead>
                  <Th>Producto</Th>
                  <Th>Proveedor</Th>
                  <Th className="text-right">Cantidad vendida</Th>
                  <Th className="text-right">Total vendido</Th>
                </THead>
                <TBody>
                  {topProducts.map((p) => (
                    <tr key={p.key} className="hover:bg-white/[0.03]">
                      <Td className="font-medium text-[var(--color-ink-on-dark)]">{p.label}</Td>
                      <Td>{providerName.get(providerOf.get(p.key) ?? '') ?? 'Sin proveedor'}</Td>
                      <Td className="text-right tabular-nums">{formatNumber(p.qty)}</Td>
                      <Td className="text-right font-medium tabular-nums text-[var(--color-ink-on-dark)]">{formatARS(p.total)}</Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
