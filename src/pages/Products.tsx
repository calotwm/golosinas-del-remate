import { useMemo, useState } from 'react'
import { Eye, Package, Pencil, Plus, Power } from 'lucide-react'
import type { Product } from '../types'
import { useApp } from '../context/AppContext'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  SearchInput,
  Select,
  StatusBadge,
  Table,
  TBody,
  Td,
  Th,
  THead,
  useToast,
} from '../components/ui'
import { CATEGORIES } from '../data/mockData'
import { formatARS, round2 } from '../utils/format'
import { totalsByProduct } from '../utils/analytics'

interface FormState {
  code: string
  name: string
  brand: string
  providerId: string
  category: string
  cost: string
  margin: string
  price: string
  status: 'Activo' | 'Inactivo'
}

const emptyForm: FormState = {
  code: '',
  name: '',
  brand: '',
  providerId: '',
  category: 'Chocolates',
  cost: '',
  margin: '20',
  price: '',
  status: 'Activo',
}

function formToProduct(form: FormState, id: string): Product {
  const cost = Number(form.cost)
  const price = Number(form.price)
  const margin = Number(form.margin)
  const computedPrice = round2(cost * (1 + margin / 100))
  const finalPrice = form.price !== '' && Math.abs(computedPrice - price) > 0.01 ? price : computedPrice
  const finalMargin = round2((finalPrice / cost - 1) * 100)
  return {
    id,
    code: form.code.trim(),
    name: form.name.trim(),
    brand: form.brand.trim() || form.providerId,
    providerId: form.providerId,
    category: form.category,
    cost,
    margin: finalMargin,
    price: finalPrice,
    status: form.status,
  }
}

export default function Products() {
  const { state, addProduct, updateProduct, toggleProductStatus } = useApp()
  const { products, providers, sales } = state
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [filterProvider, setFilterProvider] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [modal, setModal] = useState<'new' | 'edit' | 'detail' | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [toToggle, setToToggle] = useState<Product | null>(null)

  const providerOf = new Map(providers.map((p) => [p.id, p.name]))
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort(),
    [products],
  )
  const categories = useMemo(
    () => [...new Set([...CATEGORIES, ...products.map((p) => p.category)])],
    [products],
  )
  const soldByProduct = useMemo(() => {
    const map = new Map(totalsByProduct(sales).map((t) => [t.key, t]))
    return map
  }, [sales])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => {
        if (q && !p.name.toLowerCase().includes(q) && !p.code.includes(q)) return false
        if (filterProvider && p.providerId !== filterProvider) return false
        if (filterBrand && p.brand !== filterBrand) return false
        if (filterCategory && p.category !== filterCategory) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [products, query, filterProvider, filterBrand, filterCategory])

  const openNew = () => {
    setForm({ ...emptyForm, providerId: providers[0]?.id ?? '' })
    setFormError(null)
    setModal('new')
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      code: p.code,
      name: p.name,
      brand: p.brand,
      providerId: p.providerId,
      category: p.category,
      cost: String(p.cost),
      margin: String(p.margin),
      price: String(p.price),
      status: p.status,
    })
    setFormError(null)
    setModal('edit')
  }

  const save = () => {
    if (!form.name.trim() || !form.code.trim() || !form.providerId) {
      setFormError('Complete los campos obligatorios: código, nombre y proveedor.')
      return
    }
    const cost = Number(form.cost)
    if (!Number.isFinite(cost) || cost <= 0) {
      setFormError('El precio de costo debe ser un número mayor a cero.')
      return
    }
    if (modal === 'new') {
      const existing = products.find((p) => p.code === form.code.trim())
      if (existing) {
        setFormError(`Ya existe un producto con el código ${form.code.trim()}.`)
        return
      }
      const product = formToProduct(form, `prod-${Date.now()}`)
      addProduct(product)
      toast.success('Producto creado correctamente')
      setModal(null)
    } else if (editing) {
      const product = formToProduct(form, editing.id)
      updateProduct(product)
      toast.success('Producto actualizado correctamente')
      setModal(null)
    }
  }

  const onToggle = (p: Product) => {
    toggleProductStatus(p.id)
    toast.success(p.status === 'Activo' ? 'Producto desactivado' : 'Producto activado')
  }

  const computedPrice =
    form.cost && Number(form.cost) > 0
      ? round2(Number(form.cost) * (1 + (Number(form.margin) || 0) / 100))
      : null

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={`Productos (${filtered.length})`}
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre o código..." />
          <Select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}>
            <option value="">Todos los proveedores</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="No se encontraron productos"
            description="Ajuste la búsqueda o los filtros para ver más resultados."
          />
        ) : (
          <Table>
            <THead>
              <Th>Código</Th>
              <Th>Producto</Th>
              <Th>Marca</Th>
              <Th>Proveedor</Th>
              <Th>Categoría</Th>
              <Th className="text-right">Costo</Th>
              <Th className="text-right">Margen</Th>
              <Th className="text-right">Precio de venta</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </THead>
            <TBody>
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-gray-50">
                  <Td className="whitespace-nowrap text-xs tabular-nums text-gray-500">{p.code}</Td>
                  <Td className="font-medium text-gray-800">{p.name}</Td>
                  <Td>{p.brand}</Td>
                  <Td>{providerOf.get(p.providerId) ?? '—'}</Td>
                  <Td>{p.category}</Td>
                  <Td className="text-right tabular-nums">{formatARS(p.cost)}</Td>
                  <Td className="text-right tabular-nums text-gray-500">{formatMargin(p.margin)}</Td>
                  <Td className="text-right font-semibold tabular-nums text-gray-800">{formatARS(p.price)}</Td>
                  <Td>{p.status === 'Activo' ? <StatusBadge status="Activo" /> : <StatusBadge status="Inactivo" />}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <ActionBtn label="Ver detalle" onClick={() => { setEditing(p); setModal('detail') }}>
                        <Eye className="h-4 w-4" />
                      </ActionBtn>
                      <ActionBtn label="Editar" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </ActionBtn>
                      <ActionBtn
                        label={p.status === 'Activo' ? 'Desactivar' : 'Activar'}
                        danger={p.status === 'Activo'}
                        onClick={() => setToToggle(p)}
                      >
                        <Power className="h-4 w-4" />
                      </ActionBtn>
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Nuevo / Editar */}
      <Modal
        open={modal === 'new' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Nuevo producto' : `Editar producto`}
        subtitle={modal === 'edit' && editing ? `${editing.code} · ${editing.name}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button onClick={save}>
              {modal === 'new' ? 'Crear producto' : 'Guardar cambios'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Código EAN-13" required>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="7790..."
              maxLength={13}
            />
          </Field>
          <Field label="Nombre del producto" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Bon o Bon x27"
            />
          </Field>
          <Field label="Marca">
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Ej: Bon o Bon"
            />
          </Field>
          <Field label="Proveedor" required>
            <Select
              value={form.providerId}
              onChange={(e) => setForm({ ...form, providerId: e.target.value })}
            >
              <option value="">Seleccione un proveedor</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Categoría">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Precio de costo (ARS)" required>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              placeholder="0.00"
            />
          </Field>
          <Field label="Margen (%)">
            <Input
              type="number"
              step="0.01"
              value={form.margin}
              onChange={(e) => setForm({ ...form, margin: e.target.value })}
            />
          </Field>
          <Field label="Precio de venta (ARS)" hint="Se calcula con costo y margen. Si lo edita manualmente, el margen se recalcula.">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.price || (computedPrice !== null ? String(computedPrice) : '')}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />
          </Field>
        </div>
        <div className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Precio calculado: {computedPrice !== null ? formatARS(computedPrice) : '—'}
        </div>
        {formError && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}
      </Modal>

      {/* Detalle */}
      <Modal
        open={modal === 'detail' && Boolean(editing)}
        onClose={() => setModal(null)}
        title={editing?.name}
        subtitle={editing ? `${editing.code} · ${providerOf.get(editing.providerId) ?? '—'}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cerrar
            </Button>
            {editing && (
              <Button
                onClick={() => {
                  openEdit(editing)
                }}
              >
                <Pencil className="h-4 w-4" /> Editar producto
              </Button>
            )}
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoTile label="Marca" value={editing.brand} />
              <InfoTile label="Categoría" value={editing.category} />
              <InfoTile
                label="Estado"
                value={
                  editing.status === 'Activo' ? (
                    <StatusBadge status="Activo" />
                  ) : (
                    <StatusBadge status="Inactivo" />
                  )
                }
              />
              <InfoTile label="Precio de costo" value={formatARS(editing.cost)} />
              <InfoTile label="Margen" value={formatMargin(editing.margin)} />
              <InfoTile label="Precio de venta" value={formatARS(editing.price)} />
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Código de barras EAN-13</p>
              <p className="mt-1 font-mono text-lg tracking-[0.2em] text-gray-800">{editing.code}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoTile
                label="Unidades vendidas"
                value={String(soldByProduct.get(editing.id)?.qty ?? 0)}
              />
              <InfoTile
                label="Facturación acumulada"
                value={formatARS(soldByProduct.get(editing.id)?.total ?? 0)}
              />
              <InfoTile label="Ventas registradas" value={String(soldByProduct.get(editing.id)?.count ?? 0)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toToggle)}
        onClose={() => setToToggle(null)}
        onConfirm={() => toToggle && onToggle(toToggle)}
        title={toToggle?.status === 'Activo' ? 'Desactivar producto' : 'Activar producto'}
        message={
          toToggle ? (
            <>
              Se modificará el estado del producto <strong>{toToggle.name}</strong>. Los productos
              inactivos no aparecen en la búsqueda al registrar ventas.
            </>
          ) : undefined
        }
        confirmLabel={toToggle?.status === 'Activo' ? 'Desactivar' : 'Activar'}
        tone={toToggle?.status === 'Activo' ? 'danger' : 'primary'}
      />
    </div>
  )
}

function formatMargin(margin: number) {
  return `${margin.toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`
}

function ActionBtn({
  children,
  label,
  danger = false,
  onClick,
}: {
  children: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors ${
        danger
          ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
          : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {children}
    </button>
  )
}

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}
