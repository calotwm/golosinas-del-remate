import type { Client, Product, Provider, Sale } from '../types'
import { formatDate, round2 } from './format'

export interface DateBucket {
  key: string
  label: string
  total: number
  count: number
}

export interface NamedTotal {
  key: string
  label: string
  total: number
  count: number
  qty: number
}

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const isoFrom = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const addDays = (d: Date, days: number) => {
  const n = new Date(d)
  n.setDate(n.getDate() + days)
  return n
}

export function completedSales(sales: Sale[]): Sale[] {
  return sales.filter((s) => s.status === 'Completada')
}

export function salesInRange(sales: Sale[], from: string, to: string): Sale[] {
  return completedSales(sales).filter((s) => s.date >= from && s.date <= to)
}

export function sumTotals(sales: Sale[]): number {
  return round2(sales.reduce((acc, s) => acc + s.total, 0))
}

export function sumQuantity(sales: Sale[]): number {
  return sales.reduce((acc, s) => acc + s.items.reduce((q, it) => q + it.quantity, 0), 0)
}

export function lastNDays(startISO: string, days: number): string[] {
  const end = parseISO(startISO)
  const out: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    out.push(isoFrom(addDays(end, -i)))
  }
  return out
}

export function bucketByDay(sales: Sale[], from: string, to: string): DateBucket[] {
  const map = new Map<string, { total: number; count: number }>()
  for (const s of salesInRange(sales, from, to)) {
    const cur = map.get(s.date) ?? { total: 0, count: 0 }
    cur.total = round2(cur.total + s.total)
    cur.count += 1
    map.set(s.date, cur)
  }
  return lastNDays(to, Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000) + 1)
    .filter((d) => d >= from && d <= to)
    .map((d) => ({
      key: d,
      label: formatDate(d),
      total: map.get(d)?.total ?? 0,
      count: map.get(d)?.count ?? 0,
    }))
}

export function bucketByWeek(sales: Sale[], from: string, to: string): DateBucket[] {
  const weeks = new Map<string, { total: number; count: number; start: Date }>()
  for (const s of salesInRange(sales, from, to)) {
    const d = parseISO(s.date)
    const diff = (d.getDay() + 6) % 7
    const start = addDays(d, -diff)
    const key = isoFrom(start)
    const cur = weeks.get(key) ?? { total: 0, count: 0, start }
    cur.total = round2(cur.total + s.total)
    cur.count += 1
    weeks.set(key, cur)
  }
  return [...weeks.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, w]) => ({
      key,
      label: `Semana del ${formatDate(key)}`,
      total: w.total,
      count: w.count,
    }))
}

export function bucketByMonth(sales: Sale[], from: string, to: string): DateBucket[] {
  const months = new Map<string, { total: number; count: number }>()
  for (const s of salesInRange(sales, from, to)) {
    const key = s.date.slice(0, 7)
    const cur = months.get(key) ?? { total: 0, count: 0 }
    cur.total = round2(cur.total + s.total)
    cur.count += 1
    months.set(key, cur)
  }
  const monthLabel = (key: string) => {
    const [y, m] = key.split('-').map(Number)
    const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${names[m - 1]} ${y}`
  }
  return [...months.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, m]) => ({ key, label: monthLabel(key), total: m.total, count: m.count }))
}

export function totalsByClient(sales: Sale[], clients: Client[]): NamedTotal[] {
  const byId = new Map(clients.map((c) => [c.id, c]))
  const map = new Map<string, NamedTotal>()
  for (const s of completedSales(sales)) {
    const clientKey = s.clientId ?? ''
    const label = byId.get(clientKey)?.name ?? 'Cliente eliminado'
    const cur = map.get(clientKey) ?? { key: clientKey, label, total: 0, count: 0, qty: 0 }
    cur.total = round2(cur.total + s.total)
    cur.count += 1
    cur.qty += s.items.reduce((q, it) => q + it.quantity, 0)
    map.set(clientKey, cur)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

export function totalsByProduct(sales: Sale[]): NamedTotal[] {
  const map = new Map<string, NamedTotal>()
  for (const s of completedSales(sales)) {
    for (const it of s.items) {
      const cur = map.get(it.productId) ?? {
        key: it.productId,
        label: it.productName,
        total: 0,
        count: 0,
        qty: 0,
      }
      cur.total = round2(cur.total + it.subtotal)
      cur.count += 1
      cur.qty += it.quantity
      map.set(it.productId, cur)
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

export function totalsByProvider(
  sales: Sale[],
  products: Product[],
  providers: Provider[],
): NamedTotal[] {
  const providerOf = new Map(products.map((p) => [p.id, p.providerId]))
  const byId = new Map(providers.map((p) => [p.id, p]))
  const map = new Map<string, NamedTotal>()
  for (const s of completedSales(sales)) {
    for (const it of s.items) {
      const providerId = providerOf.get(it.productId) ?? 'desconocido'
      const label = byId.get(providerId)?.name ?? 'Sin proveedor'
      const cur = map.get(providerId) ?? { key: providerId, label, total: 0, count: 0, qty: 0 }
      cur.total = round2(cur.total + it.subtotal)
      cur.count += 1
      cur.qty += it.quantity
      map.set(providerId, cur)
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
