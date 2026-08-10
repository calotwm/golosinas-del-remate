import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageSearch, ShoppingCart, Trash2, UserRound } from 'lucide-react'
import type { Client, PaymentMethod, Product } from '../types'
import { useApp } from '../context/AppContext'
import { Button, Card, EmptyState, Field, Input, Select } from '../components/ui'
import { useToast } from '../components/ui'
import { formatARS, formatDate, round2, todayISO } from '../utils/format'

export default function NewSale() {
  const { state, addSale } = useApp()
  const { clients, products } = state
  const toast = useToast()
  const navigate = useNavigate()

  const [clientQuery, setClientQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  const [productQuery, setProductQuery] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [items, setItems] = useState<{ product: Product; quantity: number }[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo')
  const [error, setError] = useState<string | null>(null)

  const productInputRef = useRef<HTMLInputElement>(null)
  const clientInputRef = useRef<HTMLInputElement>(null)

  const activeClients = useMemo(
    () => clients.filter((c) => c.status === 'Activo'),
    [clients],
  )

  const clientMatches = useMemo(() => {
    const q = clientQuery.trim().toLowerCase()
    if (!selectedClient && q) {
      return activeClients
        .filter((c) => c.name.toLowerCase().includes(q) || c.cuit.includes(q))
        .slice(0, 6)
    }
    return []
  }, [activeClients, clientQuery, selectedClient])

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
    if (!selectedClient) {
      setError('Seleccione un cliente para registrar la venta.')
      return
    }
    if (items.length === 0) {
      setError('Agregue al menos un producto a la venta.')
      return
    }
    addSale({
      clientId: selectedClient.id,
      items,
      paymentMethod,
    })
    toast.success('Venta registrada correctamente')
    navigate('/ventas')
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Card title="Datos del cliente">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cliente" required>
            <div className="relative">
              <Input
                ref={clientInputRef}
                value={selectedClient ? selectedClient.name : clientQuery}
                readOnly={Boolean(selectedClient)}
                placeholder="Buscar por nombre o CUIT..."
                onChange={(e) => {
                  setClientQuery(e.target.value)
                  setSelectedClient(null)
                  setShowClientDropdown(true)
                }}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
              />
              {selectedClient && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSelectedClient(null)
                    setClientQuery('')
                    clientInputRef.current?.focus()
                  }}
                >
                  ✕
                </button>
              )}
              {showClientDropdown && clientMatches.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                  {clientMatches.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSelectedClient(c)
                        setShowClientDropdown(false)
                      }}
                    >
                      <UserRound className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.cuit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="Condición de pago">
            <Input value={selectedClient?.paymentCondition ?? '—'} disabled />
          </Field>
        </div>
      </Card>

      <Card title="Productos de la venta">
        <div className="flex flex-col gap-4">
          <Field label="Buscar producto por nombre o código" hint="Seleccione un producto de la lista para agregarlo a la venta.">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                  {productMatches.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">Sin resultados para "{productQuery}"</p>
                  ) : (
                    productMatches.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          addProduct(p)
                        }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-gray-800">{p.name}</span>
                          <span className="block text-xs text-gray-500">
                            {p.code} · {p.brand}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-medium tabular-nums text-gray-800">
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
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 text-right font-semibold">Precio unitario</th>
                    <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
                    <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it) => (
                    <tr key={it.product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-800">{it.product.name}</p>
                        <p className="text-xs text-gray-500">{it.product.code}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatARS(it.product.price)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => changeQuantity(it.product.id, Number(e.target.value))}
                          className="h-8 w-16 rounded-md border border-gray-300 px-2 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-gray-800">
                        {formatARS(round2(it.product.price * it.quantity))}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(it.product.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total de la venta · {items.length} producto{items.length === 1 ? '' : 's'}
              </p>
              <p className="text-3xl font-semibold tabular-nums text-gray-900">{formatARS(total)}</p>
              <p className="mt-1 text-xs text-gray-500">
                Los precios se copian al momento de la venta y no se modifican con cambios futuros.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">Venta para {formatDate(todayISO())} · N° {state.nextSaleNumber}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/ventas')}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={!selectedClient || items.length === 0}>
              <ShoppingCart className="h-4 w-4" />
              Registrar venta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
