import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, ChevronRight, History } from 'lucide-react'
import type { PriceChange } from '../types'
import { useApp } from '../context/AppContext'
import { Badge, Button, Card, EmptyState, Modal, Table, TBody, Td, Th, THead } from '../components/ui'
import { formatARS, formatDate, formatNumber } from '../utils/format'

export default function PriceHistory() {
  const { state } = useApp()
  const { priceChanges, providers } = state
  const [selected, setSelected] = useState<PriceChange | null>(null)

  const providerOf = new Map(providers.map((p) => [p.id, p.name]))
  const sorted = [...priceChanges].sort((a, b) => (a.date < b.date ? 1 : -1))

  const tone = (change: PriceChange) => {
    const positive =
      change.changeType === 'Porcentaje' ? (change.percent ?? 0) > 0 : (change.amount ?? 0) > 0
    return positive ? 'red' : 'green'
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
      <Card
        title="Historial de precios"
        actions={
          <Link to="/precios">
            <Button variant="secondary">Actualizar precios</Button>
          </Link>
        }
      >
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
                  className="group flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                        positive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        <span className="font-semibold">{formatDate(change.date)}</span> · Proveedor:{' '}
                        {change.providerId ? (providerOf.get(change.providerId) ?? '—') : 'Mixto'} ·
                        Modificación: <span className={positive ? 'text-red-600' : 'text-green-600'}>{change.description}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Productos afectados: {formatNumber(change.affectedCount)} · Usuario:{' '}
                        {change.user}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <Badge tone={tone(change)}>{positive ? `+${magnitude(change)}` : `-${magnitude(change)}`}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
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
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
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
                    <tr key={d.productId} className="hover:bg-gray-50">
                      <Td className="text-xs tabular-nums text-gray-500">
                        {state.products.find((p) => p.id === d.productId)?.code ?? '—'}
                      </Td>
                      <Td className="font-medium text-gray-800">{d.productName}</Td>
                      <Td className="text-right tabular-nums text-gray-500">{formatARS(d.oldPrice)}</Td>
                      <Td className="text-right font-semibold tabular-nums text-gray-800">
                        {formatARS(d.newPrice)}
                      </Td>
                      <Td
                        className={`text-right tabular-nums ${
                          variation > 0 ? 'text-red-600' : variation < 0 ? 'text-green-600' : 'text-gray-500'
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
