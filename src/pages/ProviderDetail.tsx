import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Factory, Percent, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Card, EmptyState, StatusBadge, Table, TBody, Td, Th, THead } from '../components/ui'
import { formatARS, formatNumber } from '../utils/format'

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const { state } = useApp()
  const { providers, products } = state

  const provider = providers.find((p) => p.id === id)

  const providerProducts = useMemo(
    () => products.filter((p) => p.providerId === id).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [products, id],
  )

  if (!provider) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/proveedores" className="inline-flex items-center gap-1 text-sm text-[var(--color-dim-on-dark)] hover:text-[var(--color-ink-on-dark)]">
          <ArrowLeft className="h-4 w-4" /> Volver a proveedores
        </Link>
        <EmptyState
          icon={<Factory className="h-5 w-5" />}
          title="Proveedor no encontrado"
          description="El proveedor consultado no existe o fue eliminado."
          action={
            <Link to="/proveedores">
              <Button variant="secondary">Volver al listado</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/proveedores" className="rounded-full p-2 text-[var(--color-dim-on-dark)] hover:bg-white/5 hover:text-[var(--color-ink-on-dark)]" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium tracking-tight text-[var(--color-ink-on-dark)]">{provider.name}</h1>
              {provider.status === 'Activo' ? (
                <StatusBadge status="Activo" />
              ) : (
                <StatusBadge status="Inactivo" />
              )}
            </div>
            <p className="text-sm text-[var(--color-dim-on-dark)]">CUIT {provider.cuit}</p>
          </div>
        </div>
        <Link to={`/precios?proveedor=${provider.id}`}>
          <Button>
            <Percent className="h-4 w-4" /> Actualizar precios
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile label="Teléfono" value={provider.phone} />
        <InfoTile label="Email" value={provider.email} />
        <InfoTile label="Cantidad de productos" value={formatNumber(providerProducts.length)} />
        <InfoTile
          label="Participación en el catálogo"
          value={`${products.length ? Math.round((providerProducts.length / products.length) * 100) : 0}%`}
        />
      </div>

      <Card
        title="Productos del proveedor"
        actions={
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-dim-on-dark)]">
            <Package className="h-4 w-4" />
            {formatNumber(providerProducts.length)} productos
          </span>
        }
      >
        {providerProducts.length === 0 ? (
          <EmptyState
            title="El proveedor no tiene productos cargados"
            description="Agregue productos desde el módulo de productos asignando este proveedor."
          />
        ) : (
          <Table>
            <THead>
              <Th>Código</Th>
              <Th>Producto</Th>
              <Th>Categoría</Th>
              <Th className="text-right">Costo</Th>
              <Th className="text-right">Margen</Th>
              <Th className="text-right">Precio de venta</Th>
            </THead>
            <TBody>
              {providerProducts.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                  <Td className="text-xs tabular-nums text-[var(--color-dim-on-dark)]">{p.code}</Td>
                  <Td className="font-medium text-[var(--color-ink-on-dark)]">{p.name}</Td>
                  <Td>{p.category}</Td>
                  <Td className="text-right tabular-nums">{formatARS(p.cost)}</Td>
                  <Td className="text-right tabular-nums text-[var(--color-dim-on-dark)]">
                    {p.margin.toLocaleString('es-AR', { maximumFractionDigits: 2 })}%
                  </Td>
                  <Td className="text-right font-semibold tabular-nums text-[var(--color-ink-on-dark)]">{formatARS(p.price)}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-dim-on-dark)]">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-[var(--color-ink-on-dark)]">{value}</p>
    </div>
  )
}
