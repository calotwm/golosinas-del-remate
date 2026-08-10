import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageSearch, ShoppingCart, Trash2 } from 'lucide-react'
import type { PaymentMethod, Product } from '../types'
import { useApp } from '../context/AppContext'
import { Button, Card, EmptyState, Field, Input, Select } from '../components/ui'
import { useToast } from '../components/ui'
import { formatARS, formatDate, round2, todayISO } from '../utils/format'

export default function NewSale() {
  const { state, addSale } = useApp()
  const { products } = state
  const toast = useToast()
  const navigate = useNavigate()

  const [productQuery, setProductQuery] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [items, setItems] = useState<{ product: Product; quantity: number }[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo')
  const [error, setError] = useState<string | null>(null)

  const productInputRef = useRef<HTMLInputElement>(null)

  const productMatches = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return []
    const addedIds = new Set(items.map((it) => it.product.id))
    return products
      .filter(
        (p) =>
          p.status === 'Activo' &&
          !addedIds.has(p.id) &&
          (p.name.toLowerCase().includes(q) || p.code.includes(q) || p.brand.toLowerCase().includes(q)),
      )
      .slice(0, 8)
  }, [products, productQuery, items])

  const total = round2(
    items.reduce((acc, it) => acc + round2(it.product.price * it.quantity), 0),
  )

  const addProduct = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id)
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setProductQuery('')
    setShowProductDropdown(false)
    productInputRef.current?.focus()
  }

  const changeQuantity = (productId: string, value: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.product.id === productId ? { ...it, quantity: Math.max(1, Math.floor(value)) } : it,
      ),
    )
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId))
  }

  const submit = () => {
    if (items.length === 0) {
      setError('Agregue al menos un producto a la venta.')
      return
    }
    addSale({
      items,
      paymentMethod,
    })
    toast.success('Venta registrada correctamente')
    navigate('/ventas')
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Card title="Productos de la venta">
        <div className="flex flex-col gap-4">
          <Field label="Buscar producto por nombre o código" hint="Seleccione un producto de la lista para agregarlo a la venta.">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-dim-on-dark)]">
                <PackageSearch className="h-4 w-4" />
              </div>
              <Input
                ref={productInputRef}
                value={productQuery}
                placeholder="Ej: Bon o Bon o 7790..."
                className="pl-9"
                onChange={(e) => {
                  setProductQuery(e.target.value)
                  setShowProductDropdown(true)
                }}
                onFocus={() => setShowProductDropdown(true)}
                onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
              />
              {showProductDropdown && productQuery.trim() && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-[12px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)]">
                  {productMatches.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-[var(--color-dim-on-dark)]">Sin resultados para "{productQuery}"</p>
                  ) : (
                    productMatches.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.03]"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          addProduct(p)
                        }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[var(--color-ink-on-dark)]">{p.name}</span>
                          <span className="block text-xs text-[var(--color-dim-on-dark)]">
                            {p.code} · {p.brand}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-medium tabular-nums text-[var(--color-ink-on-dark)]">
                          {formatARS(p.price)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </Field>

          {items.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-5 w-5" />}
              title="La venta está vacía"
              description="Busque productos por nombre o código de barras para comenzar a armar la venta."
            />
          ) : (
            <div className="overflow-x-auto rounded-[16px] border border-[var(--color-hairline-dark)]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] text-left text-xs uppercase tracking-wide text-[var(--color-dim-on-dark)]">
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 text-right font-semibold">Precio unitario</th>
                    <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
                    <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {items.map((it) => (
                    <tr key={it.product.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[var(--color-ink-on-dark)]">{it.product.name}</p>
                        <p className="text-xs text-[var(--color-dim-on-dark)]">{it.product.code}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatARS(it.product.price)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => changeQuantity(it.product.id, Number(e.target.value))}
                          className="h-8 w-16 rounded-[8px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] px-2 text-center text-sm text-[var(--color-ink-on-dark)] [color-scheme:dark] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-[var(--color-ink-on-dark)]">
                        {formatARS(round2(it.product.price * it.quantity))}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(it.product.id)}
                          className="rounded-md p-1.5 text-[var(--color-dim-on-dark)] transition-colors hover:bg-white/5 hover:text-[var(--color-danger)]"
                          aria-label={`Quitar ${it.product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Forma de pago" required>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cuenta corriente">Cuenta corriente</option>
            </Select>
          </Field>
          <div className="flex items-end justify-end sm:col-span-2">
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-dim-on-dark)]">
                Total de la venta · {items.length} producto{items.length === 1 ? '' : 's'}
              </p>
              <p className="font-[var(--font-display)] text-3xl font-medium tracking-tight tabular-nums text-[var(--color-ink-on-dark)]">
                {formatARS(total)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-dim-on-dark)]">
                Los precios se copian al momento de la venta y no se modifican con cambios futuros.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-[12px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-hairline-dark)] pt-4">
          <p className="text-xs text-[var(--color-dim-on-dark)]">Venta para {formatDate(todayISO())} · N° {state.nextSaleNumber}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/ventas')}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={items.length === 0}>
              <ShoppingCart className="h-4 w-4" />
              Registrar venta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
