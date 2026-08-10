import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Percent, Search } from 'lucide-react'
import type { PriceChangeType } from '../types'
import { useApp } from '../context/AppContext'
import PriceHistory from './PriceHistory'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Select,
  Table,
  TBody,
  Td,
  Th,
  THead,
  useToast,
} from '../components/ui'
import { formatARS, formatNumber, round2 } from '../utils/format'

export default function PriceUpdate() {
  const { state, applyPriceChange } = useApp()
  const { products, providers, priceChanges } = state
  const toast = useToast()
  const [params] = useSearchParams()

  const [tab, setTab] = useState<'update' | 'history'>('update')
  const [providerId, setProviderId] = useState('')
  const [changeType, setChangeType] = useState<PriceChangeType>('Porcentaje')
  const [value, setValue] = useState('')
  const [scope, setScope] = useState<'all' | 'selected'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectionQuery, setSelectionQuery] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const prefilled = params.get('proveedor')
    if (prefilled && providers.some((p) => p.id === prefilled)) {
      setProviderId(prefilled)
    }
  }, [params, providers])

  const provider = providers.find((p) => p.id === providerId)
  const providerProducts = useMemo(
    () =>
      products
        .filter((p) => p.providerId === providerId)
        .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [products, providerId],
  )

  const selectedProducts = useMemo(
    () => providerProducts.filter((p) => selected.has(p.id)),
    [providerProducts, selected],
  )

  const filteredSelection = useMemo(() => {
    const q = selectionQuery.trim().toLowerCase()
    if (!q) return providerProducts
    return providerProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.includes(q) || p.brand.toLowerCase().includes(q),
    )
  }, [providerProducts, selectionQuery])

  const amount = changeType === 'Monto fijo' ? Number(value) : null
  const percent = changeType === 'Porcentaje' ? Number(value) : null
  const hasValidValue =
    value.trim() !== '' &&
    Number.isFinite(Number(value)) &&
    ((changeType === 'Porcentaje' && percent !== 0) || (changeType === 'Monto fijo' && amount !== 0))

  const affected = scope === 'all' ? providerProducts : selectedProducts
  const affectedCount = affected.length

  const preview = useMemo(() => {
    if (!hasValidValue) return []
    return affected.map((p) => {
      let newPrice: number
      if (changeType === 'Porcentaje') {
        newPrice = round2(p.price * (1 + (percent ?? 0) / 100))
      } else {
        newPrice = round2(p.price + (amount ?? 0))
      }
      const variation = round2(newPrice - p.price)
      return { product: p, oldPrice: p.price, newPrice, variation }
    })
  }, [affected, changeType, percent, amount, hasValidValue])

  const positive = changeType === 'Porcentaje' ? (percent ?? 0) > 0 : (amount ?? 0) > 0
  const magnitude =
    changeType === 'Porcentaje'
      ? `${Math.abs(percent ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`
      : `$${Math.abs(amount ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
  const previewTitle =
    provider && hasValidValue
      ? `${provider.name} - ${positive ? 'Aumento' : 'Reducción'} de ${magnitude}`
      : 'Vista previa'

  const canPreview = Boolean(provider) && hasValidValue && (scope === 'all' || selected.size > 0)

  const toggleSelect = (productId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const toggleAllVisible = () => {
    const visibleIds = filteredSelection.map((p) => p.id)
    const allVisibleSelected = visibleIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  const confirm = () => {
    if (!canPreview || !provider) return
    const affectedIds = affected.map((p) => p.id)
    applyPriceChange({
      providerId: provider.id,
      changeType,
      percent,
      amount,
      productIds: affectedIds,
    })
    toast.success(
      `Precios actualizados correctamente: ${formatNumber(affectedIds.length)} producto${
        affectedIds.length === 1 ? '' : 's'
      } modificado${affectedIds.length === 1 ? '' : 's'}`,
    )
    setTab('history')
  }

  const reset = () => {
    setProviderId('')
    setValue('')
    setScope('all')
    setSelected(new Set())
    setSelectionQuery('')
    setError(null)
  }

  const latestChange = priceChanges[0]

  const tabCls = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--color-primary)] text-[var(--color-ink-on-dark)]'
        : 'text-[var(--color-mute-on-dark)] hover:text-[var(--color-ink-on-dark)]'
    }`

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex w-fit rounded-full border border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] p-0.5">
        <button
          type="button"
          onClick={() => setTab('update')}
          className={tabCls(tab === 'update')}
        >
          Actualizar precios
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={tabCls(tab === 'history')}
        >
          Historial de cambios
        </button>
      </div>

      {tab === 'update' ? (
        <>
      <Card title="Actualización de precios">
        <p className="mb-4 text-sm text-[var(--color-dim-on-dark)]">
          Modifique los precios de venta de un proveedor mediante un porcentaje o un monto fijo. La
          modificación queda registrada en el historial y no altera las ventas ya registradas.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Proveedor" required>
            <Select value={providerId} onChange={(e) => { setProviderId(e.target.value); setSelected(new Set()) }}>
              <option value="">Seleccione un proveedor</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({products.filter((prod) => prod.providerId === p.id).length} productos)
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de actualización" required>
            <Select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as PriceChangeType)}
            >
              <option value="Porcentaje">Porcentaje</option>
              <option value="Monto fijo">Monto fijo</option>
            </Select>
          </Field>
          <Field
            label={changeType === 'Porcentaje' ? 'Valor (%)' : 'Valor (ARS)'}
            required
            hint="Use valores negativos para reducciones."
          >
            <div className="relative">
              {changeType === 'Monto fijo' && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-dim-on-dark)]">
                  $
                </span>
              )}
              <Input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={changeType === 'Porcentaje' ? 'Ej: 3' : 'Ej: 1200'}
                className={changeType === 'Monto fijo' ? 'pl-7 pr-14' : 'pr-14'}
              />
              {changeType === 'Porcentaje' && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-dim-on-dark)]">
                  %
                </span>
              )}
            </div>
          </Field>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-[var(--color-mute-on-dark)]">Aplicar a</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-mute-on-dark)]">
              <input
                type="radio"
                name="scope"
                checked={scope === 'all'}
                onChange={() => setScope('all')}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              Todos los productos del proveedor
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-mute-on-dark)]">
              <input
                type="radio"
                name="scope"
                checked={scope === 'selected'}
                onChange={() => setScope('selected')}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              Productos seleccionados ({selected.size})
            </label>
          </div>
        </div>

        {scope === 'selected' && provider && (
          <div className="mt-4">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-dim-on-dark)]" />
              <Input
                value={selectionQuery}
                onChange={(e) => setSelectionQuery(e.target.value)}
                placeholder="Buscar productos del proveedor..."
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto rounded-[16px] border border-[var(--color-hairline-dark)]">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-[var(--color-surface-deep)]">
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-dim-on-dark)]">
                    <th className="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--color-primary)]"
                        checked={filteredSelection.length > 0 && filteredSelection.every((p) => selected.has(p.id))}
                        onChange={toggleAllVisible}
                      />
                    </th>
                    <th className="px-3 py-2 font-semibold">Producto</th>
                    <th className="px-3 py-2 text-right font-semibold">Precio actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredSelection.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.03]">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-[var(--color-ink-on-dark)]">{p.name}</p>
                        <p className="text-xs text-[var(--color-dim-on-dark)]">{p.code}</p>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatARS(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      <Card
        title={previewTitle}
        actions={
          provider && hasValidValue ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                positive
                  ? 'border-[rgba(239,68,68,0.35)] text-[var(--color-danger)]'
                  : 'border-[rgba(34,197,94,0.35)] text-[var(--color-success)]'
              }`}
            >
              {positive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              {positive ? 'Aumento' : 'Reducción'}
            </span>
          ) : undefined
        }
      >
        {!canPreview ? (
          <EmptyState
            icon={<Percent className="h-5 w-5" />}
            title="Complete los datos para ver la vista previa"
            description="Seleccione proveedor, tipo y valor de la actualización para calcular los nuevos precios."
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-[var(--color-mute-on-dark)]">
              Se modificarán <strong className="text-[var(--color-ink-on-dark)]">{formatNumber(affectedCount)}</strong> productos.
            </p>
            <div className="max-h-80 overflow-y-auto rounded-[16px] border border-[var(--color-hairline-dark)]">
              <Table>
                <THead>
                  <Th>Código</Th>
                  <Th>Producto</Th>
                  <Th className="text-right">Precio actual</Th>
                  <Th className="text-right">Nuevo precio</Th>
                  <Th className="text-right">Variación</Th>
                </THead>
                <TBody>
                  {preview.map((row) => (
                    <tr key={row.product.id} className="hover:bg-white/[0.03]">
                      <Td className="text-xs tabular-nums text-[var(--color-dim-on-dark)]">{row.product.code}</Td>
                      <Td className="font-medium text-[var(--color-ink-on-dark)]">{row.product.name}</Td>
                      <Td className="text-right tabular-nums text-[var(--color-dim-on-dark)]">{formatARS(row.oldPrice)}</Td>
                      <Td className="text-right font-semibold tabular-nums text-[var(--color-ink-on-dark)]">
                        {formatARS(row.newPrice)}
                      </Td>
                      <Td
                        className={`text-right tabular-nums ${
                          row.variation > 0 ? 'text-[var(--color-danger)]' : row.variation < 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-dim-on-dark)]'
                        }`}
                      >
                        {row.variation > 0 ? '+' : ''}
                        {formatARS(row.variation)}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </div>

            {error && (
              <p className="mt-3 rounded-[12px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--color-danger)]">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-hairline-dark)] pt-4">
              <p className="text-xs text-[var(--color-dim-on-dark)]">
                {latestChange
                  ? `Última modificación: ${latestChange.description} · ${latestChange.affectedCount} productos`
                  : 'No hay modificaciones registradas'}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={reset}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (affectedCount === 0) {
                      setError('Seleccione al menos un producto para aplicar la actualización.')
                      return
                    }
                    setError(null)
                    setConfirmOpen(true)
                  }}
                >
                  Confirmar actualización
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        title="Confirmar actualización de precios"
        tone={positive ? 'danger' : 'primary'}
        confirmLabel="Confirmar actualización"
        message={
          <>
            Se modificarán <strong className="text-[var(--color-ink-on-dark)]">{formatNumber(affectedCount)}</strong> productos de{' '}
            <strong className="text-[var(--color-ink-on-dark)]">{provider?.name}</strong> con {positive ? 'un aumento' : 'una reducción'} de{' '}
            <strong className="text-[var(--color-ink-on-dark)]">{magnitude}</strong>. La operación quedará registrada en el historial de precios.
          </>
        }
        />
        </>
      ) : (
        <PriceHistory />
      )}
    </div>
  )
}
