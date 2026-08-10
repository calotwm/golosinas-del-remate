import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, MapPin, Phone, ShoppingCart, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  StatusBadge,
  Table,
  TBody,
  Td,
  Th,
  THead,
} from '../components/ui'
import { formatARS, formatDate, formatNumber } from '../utils/format'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const { state } = useApp()
  const { clients, sales } = state

  const client = clients.find((c) => c.id === id)

  const clientSales = useMemo(
    () =>
      sales
        .filter((s) => s.clientId === id)
        .sort((a, b) => (a.date === b.date ? b.number - a.number : a.date < b.date ? 1 : -1)),
    [sales, id],
  )

  const totalPurchased = useMemo(
    () => clientSales.filter((s) => s.status === 'Completada').reduce((acc, s) => acc + s.total, 0),
    [clientSales],
  )

  if (!client) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Volver a clientes
        </Link>
        <EmptyState
          icon={<UserRound className="h-5 w-5" />}
          title="Cliente no encontrado"
          description="El cliente consultado no existe o fue eliminado."
          action={
            <Link to="/clientes">
              <Button variant="secondary">Volver al listado</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to="/clientes" className="rounded-md p-2 text-gray-500 hover:bg-gray-200" aria-label="Volver">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
            {client.status === 'Activo' ? (
              <StatusBadge status="Activo" />
            ) : (
              <StatusBadge status="Inactivo" />
            )}
          </div>
          <p className="text-sm text-gray-500">CUIT {client.cuit}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile icon={<Phone className="h-4 w-4" />} label="Teléfono" value={client.phone} />
        <Tile icon={<MapPin className="h-4 w-4" />} label="Dirección" value={client.address} />
        <Tile icon={<BadgeCheck className="h-4 w-4" />} label="Condición de pago" value={client.paymentCondition} />
        <Tile label="Email" value={client.email} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Compras realizadas</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">{formatNumber(clientSales.length)}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total comprado</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">{formatARS(totalPurchased)}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Última compra</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">
            {clientSales[0] ? formatDate(clientSales[0].date) : '—'}
          </p>
        </Card>
      </div>

      <Card
        title="Historial de compras"
        actions={
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
            <ShoppingCart className="h-4 w-4" /> {formatNumber(clientSales.length)} ventas
          </span>
        }
      >
        {clientSales.length === 0 ? (
          <EmptyState
            title="El cliente no registra compras"
            description="Las ventas realizadas a este cliente aparecerán aquí."
          />
        ) : (
          <Table>
            <THead>
              <Th>Número</Th>
              <Th>Fecha</Th>
              <Th className="text-right">Productos</Th>
              <Th className="text-right">Total</Th>
              <Th>Forma de pago</Th>
              <Th>Estado</Th>
            </THead>
            <TBody>
              {clientSales.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-gray-50">
                  <Td className="font-medium text-blue-600">#{s.number}</Td>
                  <Td>{formatDate(s.date)}</Td>
                  <Td className="text-right tabular-nums">
                    {formatNumber(s.items.reduce((acc, it) => acc + it.quantity, 0))}
                  </Td>
                  <Td className="text-right font-medium tabular-nums text-gray-800">{formatARS(s.total)}</Td>
                  <Td>{s.paymentMethod}</Td>
                  <Td>
                    {s.status === 'Completada' ? <StatusBadge status="Activo" /> : <Badge tone="gray">Anulada</Badge>}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

function Tile({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}
