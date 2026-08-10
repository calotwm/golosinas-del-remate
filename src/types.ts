export type EntityStatus = 'Activo' | 'Inactivo'

export interface Provider {
  id: string
  name: string
  cuit: string
  phone: string
  email: string
  status: EntityStatus
}

export interface Product {
  id: string
  code: string
  name: string
  brand: string
  providerId: string
  category: string
  cost: number
  margin: number
  price: number
  status: EntityStatus
}

export type PaymentCondition = 'Contado' | '30 días' | '60 días'

export interface Client {
  id: string
  name: string
  cuit: string
  phone: string
  address: string
  email: string
  paymentCondition: PaymentCondition
  status: EntityStatus
}

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Cuenta corriente'

export interface SaleItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export type SaleStatus = 'Completada' | 'Anulada'

export interface Sale {
  id: string
  number: number
  date: string
  clientId?: string | null
  items: SaleItem[]
  total: number
  paymentMethod: PaymentMethod
  status: SaleStatus
}

export interface PriceChangeDetail {
  productId: string
  productName: string
  oldPrice: number
  newPrice: number
}

export type PriceChangeType = 'Porcentaje' | 'Monto fijo'

export interface PriceChange {
  id: string
  date: string
  providerId: string | null
  description: string
  changeType: PriceChangeType
  percent: number | null
  amount: number | null
  affectedCount: number
  user: string
  details: PriceChangeDetail[]
}

export interface Settings {
  businessName: string
  cuit: string
  address: string
  phone: string
  email: string
  user: string
  currency: string
}

export interface AppData {
  providers: Provider[]
  products: Product[]
  clients: Client[]
  sales: Sale[]
  priceChanges: PriceChange[]
  settings: Settings
}
