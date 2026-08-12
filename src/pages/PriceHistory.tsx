import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ChevronRight, History } from 'lucide-react'
import type { PriceChange } from '../types'
import { useApp } from '../context/AppContext'
import { Badge, Button, Card, EmptyState, Modal, Table, TBody, Td, Th, THead } from '../components/ui'
import { formatARS, formatDate, formatNumber } from '../utils/format'

export default function PriceHistory() {
  const { state } = useApp()
  const { priceChanges, providers, products } = state
  const [selected, setSelected] = useState<PriceChange | null>(null)

  const providerOf = new Map(providers.map((p) => [p.id, p.name]))
  const sorted = [...priceChanges].sort((a, b) => (a.date < b.date ? 1 : -1))

  const tone = (change: PriceChange) => {
    const positive =
      change.changeType === 'Porcentaje' ? (change.percent ?? 0) > 0 : (change.amount ?? 0) > 0
    return positive ? 'naranja' : 'green'
  }

  const magnitude = (change: PriceChange) => {
    const value =
      change.changeType === 'Porcentaje'
        ? Math.abs(change.percent ?? 0)
        : Math.abs(change.amount ?? 0)
    const suffix = change.changeType === 'Porcentaje' ? '%' : ''
    return `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}${suffix}`
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Historial de precios">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<History className="h-5 w-5" />}
            title="No hay modificaciones de precios"
            description="Cuando aplique una actualización de precios, quedará registrada aquí."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((change) => {
              const positive =
                change.changeType === 'Porcentaje'
                  ? (change.percent ?? 0) > 0
                  : (change.amount ?? 0) > 0
              return (
                <button
                  key={change.id}
                  type="button"
                  onClick={() => setSelected(change)}
                  className="group flex w-full flex-col gap-2 rounded-[16px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-4 py-3 text-left shadow-[0_2px_8px_-1px_rgba(42,21,18,0.06)] transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-row-tint)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] ${
                        positive ? 'text-[var(--color-accent-deep)]' : 'text-[var(--color-success)]'
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">
                        <span className="font-semibold">{formatDate(change.date)}</span> · Proveedor:{' '}
                        {change.providerId ? (providerOf.get(change.providerId) ?? '—') : 'Mixto'} ·
                        Modificación:{' '}
                        <span className={positive ? 'text-[var(--color-accent-deep)]' : 'text-[var(--color-success)]'}>
                          {change.description}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-dim)]">
                        Productos afectados: {formatNumber(change.affectedCount)} · Usuario:{' '}
                        {change.user}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <Badge tone={tone(change)}>{positive ? `+${magnitude(change)}` : `-${magnitude(change)}`}</Badge>
                    <ChevronRight className="h-4 w-4 text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink)]" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${providerOf.get(selected.providerId ?? '') ?? 'Mixto'} · ${selected.description}` : ''}
        subtitle={selected ? `${formatDate(selected.date)} · ${formatNumber(selected.affectedCount)} productos · Usuario: ${selected.user}` : undefined}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Cerrar
          </Button>
        }
      >
        {selected && (
          <div className="max-h-96 overflow-y-auto rounded-[16px] border border-[var(--color-hairline-dark)]">
            <Table>
              <THead>
                <Th>Código</Th>
                <Th>Producto</Th>
                <Th className="text-right">Precio anterior</Th>
                <Th className="text-right">Nuevo precio</Th>
                <Th className="text-right">Variación</Th>
              </THead>
              <TBody>
                {selected.details.map((d) => {
                  const variation = d.newPrice - d.oldPrice
                  return (
                    <tr key={d.productId} className="hover:bg-[var(--color-row-tint)]">
                      <Td className="text-xs tabular-nums text-[var(--color-ink-dim)]">
                        {products.find((p) => p.id === d.productId)?.code ?? '—'}
                      </Td>
                      <Td className="font-medium text-[var(--color-ink)]">{d.productName}</Td>
                      <Td className="text-right tabular-nums text-[var(--color-ink-dim)]">{formatARS(d.oldPrice)}</Td>
                      <Td className="text-right font-semibold tabular-nums text-[var(--color-ink)]">
                        {formatARS(d.newPrice)}
                      </Td>
                      <Td
                        className={`text-right tabular-nums ${
                          variation > 0 ? 'text-[var(--color-accent-deep)]' : variation < 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-ink-dim)]'
                        }`}
                      >
                        {variation > 0 ? '+' : ''}
                        {formatARS(variation)}
                      </Td>
                    </tr>
                  )
                })}
              </TBody>
            </Table>
          </div>
        )}
      </Modal>
    </div>
  )
}
