import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import type { PaymentCondition } from '../types'
import { useApp } from '../context/AppContext'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  StatusBadge,
  Table,
  TBody,
  Td,
  Th,
  THead,
  useToast,
} from '../components/ui'

const emptyForm = {
  name: '',
  cuit: '',
  phone: '',
  address: '',
  email: '',
  paymentCondition: 'Contado' as PaymentCondition,
}

export default function Clients() {
  const { state, addClient } = useApp()
  const { clients } = state
  const navigate = useNavigate()
  const toast = useToast()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    if (!form.name.trim() || !form.cuit.trim()) {
      setError('Complete los campos obligatorios: nombre/razón social y CUIT.')
      return
    }
    addClient({
      id: `cli-${Date.now()}`,
      ...form,
      name: form.name.trim(),
      cuit: form.cuit.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      status: 'Activo',
    })
    toast.success('Cliente creado correctamente')
    setOpen(false)
    setForm(emptyForm)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={`Clientes (${clients.length})`}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        }
      >
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No hay clientes registrados"
            description="Cree un cliente para registrar ventas."
          />
        ) : (
          <Table>
            <THead>
              <Th>Nombre / Razón social</Th>
              <Th>CUIT</Th>
              <Th>Teléfono</Th>
              <Th>Dirección</Th>
              <Th>Email</Th>
              <Th>Condición de pago</Th>
              <Th>Estado</Th>
            </THead>
            <TBody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors hover:bg-blue-50/50"
                  onClick={() => navigate(`/clientes/${c.id}`)}
                >
                  <Td className="font-medium text-blue-600">{c.name}</Td>
                  <Td className="tabular-nums">{c.cuit}</Td>
                  <Td className="tabular-nums">{c.phone}</Td>
                  <Td>{c.address}</Td>
                  <Td>{c.email}</Td>
                  <Td>{c.paymentCondition}</Td>
                  <Td>{c.status === 'Activo' ? <StatusBadge status="Activo" /> : <StatusBadge status="Inactivo" />}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo cliente"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Crear cliente</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Nombre / Razón social" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Kiosco La Esquina"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="CUIT" required>
              <Input
                value={form.cuit}
                onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                placeholder="20-00000000-0"
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="011-0000-0000"
              />
            </Field>
          </div>
          <Field label="Dirección">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Av. Corrientes 1234"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contacto@cliente.com.ar"
              />
            </Field>
            <Field label="Condición de pago">
              <Select
                value={form.paymentCondition}
                onChange={(e) => setForm({ ...form, paymentCondition: e.target.value as PaymentCondition })}
              >
                <option value="Contado">Contado</option>
                <option value="30 días">30 días</option>
                <option value="60 días">60 días</option>
              </Select>
            </Field>
          </div>
        </div>
        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </Modal>
    </div>
  )
}
