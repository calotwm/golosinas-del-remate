import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Undo2, XCircle } from 'lucide-react'
import type { PaymentMethod, Sale } from '../types'
import { useApp } from '../context/AppContext'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Table,
  TBody,
  Td,
  Th,
  THead,
  useToast,
} from '../components/ui'
import { formatARS, formatDate, formatNumber, round2 } from '../utils/format'

export default function SalesHistory() {
  const { setSaleStatus } = useApp()
  const { sales } = useApp().state
  const toast = useToast()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selected, setSelected] = useState<Sale | null>(null)

  const filtered = useMemo(() => {
    return [...sales]
      .filter((s) => {
        if (from && s.date < from) return false
        if (to && s.date > to) return false
        if (paymentMethod && s.paymentMethod !== paymentMethod) return false
        return true
      })
      .sort((a, b) => (a.date === b.date ? b.number - a.number : a.date < b.date ? 1 : -1))
  }, [sales, from, to, paymentMethod])

  const quantityOf = (s: Sale) => s.items.reduce((acc, it) => acc + it.quantity, 0)

  const toggleStatus = (s: Sale) => {
    const next = s.status === 'Completada' ? 'Anulada' : 'Completada'
    setSaleStatus(s.id, next)
    setSelected((prev) => (prev && prev.id === s.id ? { ...prev, status: next } : prev))
    toast.success(next === 'Anulada' ? 'Venta anulada correctamente' : 'Venta reactivada correctamente')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Historial de ventas">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Fecha desde">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Fecha hasta">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="Forma de pago">
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}>
              <option value="">Todas</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cuenta corriente">Cuenta corriente</option>
            </Select>
          </Field>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="No se encontraron ventas"
            description="Ajuste los filtros o registre una nueva venta."
            action={
              <Link to="/ventas/nueva">
                <Button>Registrar venta</Button>
              </Link>
            }
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
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  onClick={() => setSelected(s)}
                >
                  <Td className="font-medium text-[var(--color-primary)]">#{s.number}</Td>
                  <Td>{formatDate(s.date)}</Td>
                  <Td className="text-right tabular-nums">{formatNumber(quantityOf(s))}</Td>
                  <Td className="text-right font-medium tabular-nums text-[var(--color-ink-on-dark)]">{formatARS(s.total)}</Td>
                  <Td>{s.paymentMethod}</Td>
                  <Td>
                    {s.status === 'Completada' ? (
                      <Badge tone="green">Completada</Badge>
                    ) : (
                      <Badge tone="amber">Anulada</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Venta #${selected.number}` : ''}
        subtitle={
          selected ? (
            <span className="flex items-center gap-2">
              {formatDate(selected.date)} · {selected.paymentMethod}
            </span>
          ) : undefined
        }
        size="lg"
        footer={
          selected ? (
            <>
              <Button
                variant={selected.status === 'Completada' ? 'danger-ghost' : 'secondary'}
                onClick={() => toggleStatus(selected)}
              >
                {selected.status === 'Completada' ? (
                  <>
                    <XCircle className="h-4 w-4" /> Anular venta
                  </>
                ) : (
                  <>
                    <Undo2 className="h-4 w-4" /> Reactivar venta
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cerrar
              </Button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 text-sm">
              {selected.status === 'Completada' ? (
                <Badge tone="green">Completada</Badge>
              ) : (
                <Badge tone="amber">Anulada</Badge>
              )}
              <span className="rounded-full border border-[var(--color-hairline-dark)] px-2.5 py-0.5 text-sm text-[var(--color-mute-on-dark)]">
                {selected.items.length} líneas de detalle
              </span>
            </div>

            <div className="overflow-x-auto rounded-[16px] border border-[var(--color-hairline-dark)]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] text-left text-xs uppercase tracking-wide text-[var(--color-dim-on-dark)]">
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 text-right font-semibold">Precio unitario</th>
                    <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
                    <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {selected.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 font-medium text-[var(--color-ink-on-dark)]">{it.productName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatARS(it.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-center tabular-nums">{formatNumber(it.quantity)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-ink-on-dark)]">
                        {formatARS(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between rounded-[12px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] px-4 py-3">
              <span className="text-sm text-[var(--color-mute-on-dark)]">
                Total {selected.paymentMethod} · precios de venta al {formatDate(selected.date)}
              </span>
              <span className="font-[var(--font-display)] text-lg font-medium tabular-nums text-[var(--color-ink-on-dark)]">
                {formatARS(round2(selected.total))}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
