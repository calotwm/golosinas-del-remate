import { useState } from 'react'
import { Building2, CircleDollarSign, RefreshCw, Save, UserRound } from 'lucide-react'
import type { Settings } from '../types'
import { useApp } from '../context/AppContext'
import { Button, Card, ConfirmDialog, Field, Input } from '../components/ui'
import { useToast } from '../components/ui'

export default function SettingsPage() {
  const { state, updateSettings, resetData } = useApp()
  const toast = useToast()

  const [form, setForm] = useState<Settings>({ ...state.settings })
  const [resetOpen, setResetOpen] = useState(false)

  const dirty = JSON.stringify(form) !== JSON.stringify(state.settings)

  const save = () => {
    updateSettings(form)
    toast.success('Configuración guardada correctamente')
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Card title="Información del negocio" actions={<Building2 className="h-4 w-4 text-gray-400" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Razón social">
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </Field>
          <Field label="CUIT">
            <Input value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} />
          </Field>
          <Field label="Dirección">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Teléfono">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end border-t border-gray-200 pt-4">
          <Button onClick={save} disabled={!dirty}>
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </div>
      </Card>

      <Card title="Preferencias" actions={<CircleDollarSign className="h-4 w-4 text-gray-400" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Moneda preferida" hint="Formato de moneda argentina (ARS).">
            <Input value="Peso argentino (ARS) — $" disabled />
          </Field>
          <Field label="Cuenta de usuario">
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={form.user} className="pl-9" onChange={(e) => setForm({ ...form, user: e.target.value })} />
            </div>
          </Field>
        </div>
        <div className="mt-5 flex justify-end border-t border-gray-200 pt-4">
          <Button onClick={save} disabled={!dirty}>
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </div>
      </Card>

      <Card title="Apariencia" actions={<CircleDollarSign className="h-4 w-4 text-gray-400" />}>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          El sistema utiliza un esquema profesional de escritorio: barra lateral oscura, área de
          trabajo clara y acentos en azul. No se encuentra disponible un selector de tema en esta
          versión.
        </div>
      </Card>

      <Card title="Datos de demostración">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Los datos de la aplicación se guardan en este navegador. Restablezca el catálogo, las
            ventas y el historial al estado inicial de demostración.
          </p>
          <Button variant="danger-ghost" onClick={() => setResetOpen(true)}>
            <RefreshCw className="h-4 w-4" /> Restablecer datos
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetData}
        title="Restablecer datos de demostración"
        confirmLabel="Restablecer"
        tone="danger"
        message="Se eliminarán todas las modificaciones realizadas (productos, clientes, ventas y cambios de precio) y se restaurarán los datos iniciales del prototipo. Esta acción no se puede deshacer."
      />
    </div>
  )
}
