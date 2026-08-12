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
    'bg-[var(--color-primary)] text-white hover:brightness-110 active:scale-[0.98]',
  secondary:
    'border border-[var(--color-hairline-dark)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-hover-tint)]',
  danger: 'bg-[var(--color-primary-deep)] text-white hover:brightness-110 active:scale-[0.98]',
  ghost: 'text-[var(--color-ink)] hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-ink)]',
  'danger-ghost': 'text-[var(--color-danger)] hover:bg-[var(--color-danger-tint)]',
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
    <section className={`rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] shadow-[0_4px_16px_-2px_rgba(42,21,18,0.08),0_1px_3px_rgba(42,21,18,0.04),inset_0_1px_0_0_rgba(255,253,248,0.9)] ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline-dark)] px-5 py-3.5">
          <h3 className="font-[var(--font-display)] text-sm font-normal tracking-tight text-[var(--color-ink)]">
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[var(--color-scrim)] p-4 sm:py-10">
      <div
        className={`w-full ${sizes[size]} rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] shadow-[0_8px_32px_-4px_rgba(42,21,18,0.16)]`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline-dark)] px-5 py-4">
          <div>
            <h2 className="font-[var(--font-display)] text-lg tracking-tight text-[var(--color-ink)]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[var(--color-ink-dim)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--color-ink-dim)] transition-colors hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-ink)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 rounded-b-[20px] border-t border-[var(--color-hairline-dark)] bg-[var(--color-canvas)] px-5 py-3.5">
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
          className={`mt-0.5 rounded-full bg-[var(--color-hover-tint)] p-2 ${
            tone === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="text-sm text-[var(--color-ink-muted)]">{message}</div>
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
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-ink-muted)]">
        {label}
        {required && <span className="text-[var(--color-primary)]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-ink-dim)]">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full h-9 rounded-[12px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-dim)] [color-scheme:light] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed'

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
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-dim)]" />
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
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
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
  green: 'border-[rgba(43,138,62,0.3)] text-[var(--color-success)]',
  gray: 'border-[var(--color-hairline-dark)] text-[var(--color-ink-muted)]',
  red: 'border-[rgba(160,30,28,0.3)] text-[var(--color-danger)]',
  naranja: 'border-[rgba(252,137,61,0.35)] text-[var(--color-accent-deep)]',
  blue: 'border-[rgba(37,99,235,0.3)] text-[#2563eb]',
  amber: 'border-[rgba(180,83,9,0.3)] text-[var(--color-warning)]',
  purple: 'border-[rgba(126,87,194,0.3)] text-[#6d4c9f]',
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
      <tr className="sticky top-0 z-10 border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-deep)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
        {children}
      </tr>
    </thead>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`border-b border-[var(--color-hairline-dark)] px-4 py-2.5 align-middle text-[var(--color-ink-muted)] ${className}`}>{children}</td>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--color-hairline-dark)]">{children}</tbody>
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
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[var(--color-hairline-dark)] bg-[var(--color-surface-tint)] px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-hover-tint)] text-[var(--color-primary)] ring-1 ring-[var(--color-hairline-dark)]">
        {icon ?? <Info className="h-5 w-5" />}
      </div>
      <p className="text-sm font-semibold text-[var(--color-ink)]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-[var(--color-ink-dim)]">{description}</p>}
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
    <div className="rounded-[20px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] p-4 shadow-[0_2px_8px_-1px_rgba(42,21,18,0.06),inset_0_1px_0_0_rgba(255,253,248,0.9)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-ink-dim)]">{label}</p>
          <p className="mt-1.5 truncate font-[var(--font-display)] text-2xl font-normal tracking-tight text-[var(--color-ink)]">{value}</p>
          {sub && <div className="mt-1 text-xs text-[var(--color-ink-dim)]">{sub}</div>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-hover-tint)] text-[var(--color-primary)]">
            {icon}
          </div>
        )}
      </div>
    </div>
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
            className="pointer-events-auto flex items-start gap-3 rounded-[12px] border border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated)] px-4 py-3 shadow-[0_4px_12px_-2px_rgba(42,21,18,0.1)]"
          >
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <p className="text-sm text-[var(--color-ink)]">{t.message}</p>
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
