import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, Search, X, XCircle } from 'lucide-react'

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'danger-ghost'
type ButtonSize = 'sm' | 'md'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-ink-on-dark)] hover:brightness-110 active:scale-[0.98]',
  secondary:
    'border border-[var(--color-hairline-dark)] bg-transparent text-[var(--color-ink-on-dark)] hover:border-[var(--color-hairline-strong)] hover:bg-white/5',
  danger: 'bg-[var(--color-danger)] text-[var(--color-ink-on-dark)] hover:brightness-110 active:scale-[0.98]',
  ghost: 'text-[var(--color-mute-on-dark)] hover:bg-white/5 hover:text-[var(--color-ink-on-dark)]',
  'danger-ghost': 'text-[var(--color-danger)] hover:bg-white/5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  type?: 'button' | 'submit'
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeCls = size === 'sm' ? 'h-8 px-2.5 text-sm gap-1.5' : 'h-9 px-4 text-sm gap-2'
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${sizeCls} ${buttonVariants[variant]} ${className}`}
      {...rest}
    />
  )
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({
  title,
  actions,
  className = '',
  children,
}: {
  title?: ReactNode
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline-dark)] px-5 py-3.5">
          <h3 className="font-[var(--font-display)] text-sm font-semibold tracking-tight text-[var(--color-ink-on-dark)]">
            {title}
          </h3>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

/* ---------------------------------- Modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:py-10">
      <div
        className={`w-full ${sizes[size]} rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)]`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline-dark)] px-5 py-4">
          <div>
            <h2 className="font-[var(--font-display)] text-lg tracking-tight text-[var(--color-ink-on-dark)]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[var(--color-dim-on-dark)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--color-dim-on-dark)] transition-colors hover:bg-white/5 hover:text-[var(--color-ink-on-dark)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 rounded-b-[20px] border-t border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  confirmDisabled = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  confirmDisabled?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-full bg-white/5 p-2 ${
            tone === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="text-sm text-[var(--color-mute-on-dark)]">{message}</div>
      </div>
    </Modal>
  )
}

/* ---------------------------------- Forms ---------------------------------- */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-mute-on-dark)]">
        {label}
        {required && <span className="text-[var(--color-primary)]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-dim-on-dark)]">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full h-9 rounded-[12px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] px-3 text-sm text-[var(--color-ink-on-dark)] placeholder:text-[var(--color-dim-on-dark)] [color-scheme:dark] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed'

export function Input({
  className = '',
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={`${inputBase} ${className}`} {...rest} />
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputBase} ${className}`} {...rest} />
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} h-auto py-2 ${className}`} {...rest} />
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-dim-on-dark)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} pl-9 pr-8`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--color-dim-on-dark)] hover:text-[var(--color-ink-on-dark)]"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/* ---------------------------------- Badge ---------------------------------- */

const badgeStyles: Record<string, string> = {
  green: 'border-[rgba(34,197,94,0.35)] text-[var(--color-success)]',
  gray: 'border-[rgba(255,255,255,0.2)] text-[var(--color-mute-on-dark)]',
  red: 'border-[rgba(239,68,68,0.35)] text-[var(--color-danger)]',
  blue: 'border-[rgba(96,165,250,0.35)] text-[#60a5fa]',
  amber: 'border-[rgba(234,179,8,0.35)] text-[var(--color-warning)]',
  purple: 'border-[rgba(167,139,250,0.35)] text-[#a78bfa]',
}

export function Badge({
  tone = 'gray',
  children,
}: {
  tone?: keyof typeof badgeStyles
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeStyles[tone]}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: 'Activo' | 'Inactivo' }) {
  return <Badge tone={status === 'Activo' ? 'green' : 'gray'}>{status}</Badge>
}

/* ---------------------------------- Table ---------------------------------- */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-[var(--color-hairline-dark)]">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="sticky top-0 z-10 border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] text-left text-xs uppercase tracking-wide text-[var(--color-dim-on-dark)]">
        {children}
      </tr>
    </thead>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`border-b border-white/[0.06] px-4 py-2.5 align-middle text-[var(--color-mute-on-dark)] ${className}`}>{children}</td>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-white/[0.06]">{children}</tbody>
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)]/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[var(--color-dim-on-dark)] ring-1 ring-[var(--color-hairline-dark)]">
        {icon ?? <Info className="h-5 w-5" />}
      </div>
      <p className="text-sm font-semibold text-[var(--color-ink-on-dark)]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-[var(--color-dim-on-dark)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* --------------------------------- StatCard -------------------------------- */

export function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  sub?: ReactNode
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-dim-on-dark)]">{label}</p>
          <p className="mt-1.5 truncate font-[var(--font-display)] text-2xl font-medium tracking-tight text-[var(--color-ink-on-dark)]">{value}</p>
          {sub && <div className="mt-1 text-xs text-[var(--color-dim-on-dark)]">{sub}</div>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------- KpiCard -------------------------------- */

export function KpiCard({
  label,
  value,
  subtitle,
  trend,
  variant = 'default',
}: {
  label: string
  value: string
  subtitle?: string
  trend?: string
  variant?: 'default' | 'glass'
}) {
  const isGlass = variant === 'glass'
  const baseClass = isGlass
    ? 'glass-card p-8'
    : 'group relative overflow-hidden rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.25)]'

  return (
    <div className={baseClass}>
      {!isGlass && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--gradient-surface)' }}
        />
      )}
      <div className="absolute left-0 top-0 h-[3px] w-full bg-[var(--color-primary)]" />
      <p className="relative text-sm font-medium text-[var(--color-mute-on-dark)]">
        {label}
      </p>
      <p className="relative mt-3 font-[var(--font-display)] text-2xl font-medium tracking-tight text-[var(--color-ink-on-dark)]">
        {value}
      </p>
      {subtitle && (
        <p className="relative mt-1.5 text-xs text-[var(--color-dim-on-dark)]">
          {subtitle}
        </p>
      )}
      {trend && (
        <p className="relative mt-1.5 text-xs font-medium text-[var(--color-success)]">
          {trend}
        </p>
      )}
    </div>
  )
}

/* ------------------------------- GrainOverlay ------------------------------ */

// Film grain overlay — sits ABOVE all content (z-[100]), pointer-events-none,
// screen blend so it's visible on dark backgrounds.
const GRAIN_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{
        backgroundImage: GRAIN_URI,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        opacity: 0.15,
        mixBlendMode: 'screen',
      }}
    />
  )
}

/* ---------------------------------- Toasts --------------------------------- */

type ToastType = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  type: ToastType
  message: string
}

const ToastContext = createContext<{
  toast: (type: ToastType, message: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
    error: <XCircle className="h-5 w-5 text-[var(--color-danger)]" />,
    info: <Info className="h-5 w-5 text-[var(--color-primary)]" />,
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-[12px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-4 py-3"
          >
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <p className="text-sm text-[var(--color-ink-on-dark)]">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return {
    success: (message: string) => ctx.toast('success', message),
    error: (message: string) => ctx.toast('error', message),
    info: (message: string) => ctx.toast('info', message),
  }
}
