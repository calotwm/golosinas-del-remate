import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Factory, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  StatusBadge,
  Table,
  TBody,
  Td,
  Th,
  THead,
  useToast,
} from '../components/ui'
import { formatNumber } from '../utils/format'

const emptyForm = { name: '', cuit: '', phone: '', email: '' }

export default function Providers() {
  const { state, addProvider } = useApp()
  const { providers, products } = state
  const navigate = useNavigate()
  const toast = useToast()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const countOf = new Map<string, number>()
  products.forEach((p) => countOf.set(p.providerId, (countOf.get(p.providerId) ?? 0) + 1))

  const save = () => {
    if (!form.name.trim() || !form.cuit.trim()) {
      setError('Complete los campos obligatorios: nombre y CUIT.')
      return
    }
    addProvider({
      id: `prov-${Date.now()}`,
      name: form.name.trim(),
      cuit: form.cuit.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: 'Activo',
    })
    toast.success('Proveedor creado correctamente')
    setOpen(false)
    setForm(emptyForm)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={`Proveedores (${providers.length})`}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo proveedor
          </Button>
        }
      >
        {providers.length === 0 ? (
          <EmptyState
            icon={<Factory className="h-5 w-5" />}
            title="No hay proveedores registrados"
            description="Cree un proveedor para comenzar a cargar productos."
          />
        ) : (
          <Table>
            <THead>
              <Th>Nombre</Th>
              <Th>CUIT</Th>
              <Th>Teléfono</Th>
              <Th>Email</Th>
              <Th className="text-right">Productos</Th>
              <Th>Estado</Th>
            </THead>
            <TBody>
              {providers.map((p) => (
                <tr
                  key={p.id}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer transition-colors hover:bg-[var(--color-row-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                  onClick={() => navigate(`/proveedores/${p.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/proveedores/${p.id}`); } }}
                >
                  <Td className="font-medium text-[var(--color-primary)]">{p.name}</Td>
                  <Td className="tabular-nums">{p.cuit}</Td>
                  <Td className="tabular-nums">{p.phone}</Td>
                  <Td>{p.email}</Td>
                  <Td className="text-right tabular-nums">{formatNumber(countOf.get(p.id) ?? 0)}</Td>
                  <Td>{p.status === 'Activo' ? <StatusBadge status="Activo" /> : <StatusBadge status="Inactivo" />}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo proveedor"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Crear proveedor</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Nombre" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Arcor"
            />
          </Field>
          <Field label="CUIT" required>
            <Input
              value={form.cuit}
              onChange={(e) => setForm({ ...form, cuit: e.target.value })}
              placeholder="30-00000000-0"
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="011-0000-0000"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ventas@proveedor.com.ar"
            />
          </Field>
        </div>
        {error && (
          <p className="mt-3 rounded-[12px] border border-[rgba(160,30,28,0.3)] bg-[var(--color-danger-tint-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>
        )}
      </Modal>
    </div>
  )
}
