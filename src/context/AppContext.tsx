import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import type {
  AppData,
  Client,
  PriceChange,
  PriceChangeType,
  Product,
  Provider,
  Sale,
  SaleItem,
  Settings,
} from '../types'
import { STORAGE_KEY, buildMockData } from '../data/mockData'
import { round2, todayISO } from '../utils/format'

interface AppState extends AppData {
  nextSaleNumber: number
}

type Action =
  | { type: 'ADD_SALE'; sale: Sale }
  | { type: 'SET_SALE_STATUS'; saleId: string; status: Sale['status'] }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'UPDATE_PRODUCT'; product: Product }
  | { type: 'TOGGLE_PRODUCT_STATUS'; productId: string }
  | { type: 'APPLY_PRICE_CHANGE'; change: PriceChange }
  | { type: 'ADD_PROVIDER'; provider: Provider }
  | { type: 'UPDATE_PROVIDER'; provider: Provider }
  | { type: 'TOGGLE_PROVIDER_STATUS'; providerId: string }
  | { type: 'ADD_CLIENT'; client: Client }
  | { type: 'UPDATE_CLIENT'; client: Client }
  | { type: 'TOGGLE_CLIENT_STATUS'; clientId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Settings }

export interface NewSaleInput {
  clientId: string
  items: { product: Product; quantity: number }[]
  paymentMethod: Sale['paymentMethod']
}

export interface PriceChangeInput {
  providerId: string | null
  changeType: PriceChangeType
  percent: number | null
  amount: number | null
  productIds: string[]
}

function makeInitialState(): AppState {
  const data = buildMockData()
  return {
    ...data,
    nextSaleNumber: Math.max(1000, ...data.sales.map((s) => s.number)) + 1,
  }
}

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      return {
        ...parsed,
        nextSaleNumber: Math.max(1000, ...parsed.sales.map((s) => s.number)) + 1,
      }
    }
  } catch {
    // corrupted storage -> reseed
  }
  return makeInitialState()
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_SALE':
      return { ...state, sales: [action.sale, ...state.sales], nextSaleNumber: action.sale.number + 1 }
    case 'SET_SALE_STATUS':
      return {
        ...state,
        sales: state.sales.map((s) => (s.id === action.saleId ? { ...s, status: action.status } : s)),
      }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.product] }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.product.id ? action.product : p)),
      }
    case 'TOGGLE_PRODUCT_STATUS':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId
            ? { ...p, status: p.status === 'Activo' ? 'Inactivo' : 'Activo' }
            : p,
        ),
      }
    case 'APPLY_PRICE_CHANGE':
      return {
        ...state,
        products: state.products.map((p) => {
          const detail = action.change.details.find((d) => d.productId === p.id)
          return detail ? { ...p, price: detail.newPrice } : p
        }),
        priceChanges: [action.change, ...state.priceChanges],
      }
    case 'ADD_PROVIDER':
      return { ...state, providers: [...state.providers, action.provider] }
    case 'UPDATE_PROVIDER':
      return {
        ...state,
        providers: state.providers.map((p) => (p.id === action.provider.id ? action.provider : p)),
      }
    case 'TOGGLE_PROVIDER_STATUS':
      return {
        ...state,
        providers: state.providers.map((p) =>
          p.id === action.providerId
            ? { ...p, status: p.status === 'Activo' ? 'Inactivo' : 'Activo' }
            : p,
        ),
      }
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.client] }
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((c) => (c.id === action.client.id ? action.client : c)),
      }
    case 'TOGGLE_CLIENT_STATUS':
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.clientId
            ? { ...c, status: c.status === 'Activo' ? 'Inactivo' : 'Activo' }
            : c,
        ),
      }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.settings }
    default:
      return state
  }
}

function buildSale(input: NewSaleInput, number: number): Sale {
  const items: SaleItem[] = input.items.map((it) => {
    const unitPrice = round2(it.product.price)
    return {
      productId: it.product.id,
      productName: it.product.name,
      unitPrice,
      quantity: it.quantity,
      subtotal: round2(unitPrice * it.quantity),
    }
  })
  return {
    id: `sal-${Date.now()}`,
    number,
    date: todayISO(),
    clientId: input.clientId,
    items,
    total: round2(items.reduce((acc, it) => acc + it.subtotal, 0)),
    paymentMethod: input.paymentMethod,
    status: 'Completada',
  }
}

export interface AppContextValue {
  state: AppState
  addSale: (input: NewSaleInput) => Sale
  setSaleStatus: (saleId: string, status: Sale['status']) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  toggleProductStatus: (productId: string) => void
  applyPriceChange: (input: PriceChangeInput) => PriceChange
  addProvider: (provider: Provider) => void
  updateProvider: (provider: Provider) => void
  toggleProviderStatus: (providerId: string) => void
  addClient: (client: Client) => void
  updateClient: (client: Client) => void
  toggleClientStatus: (clientId: string) => void
  updateSettings: (settings: Settings) => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)

  useEffect(() => {
    const { nextSaleNumber: _omit, ...data } = state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage full or unavailable; the app keeps working in memory
    }
  }, [state])

  const value = useMemo<AppContextValue>(() => {
    const buildPriceChange = (input: PriceChangeInput): PriceChange => {
      const details = input.productIds
        .map((id) => state.products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .map((p) => {
          let newPrice: number
          if (input.changeType === 'Porcentaje') {
            newPrice = round2(p.price * (1 + (input.percent ?? 0) / 100))
          } else {
            newPrice = round2(p.price + (input.amount ?? 0))
          }
          return { productId: p.id, productName: p.name, oldPrice: p.price, newPrice }
        })
      const positive =
        input.changeType === 'Porcentaje'
          ? (input.percent ?? 0) > 0
          : (input.amount ?? 0) > 0
      const magnitude =
        input.changeType === 'Porcentaje'
          ? `${Math.abs(input.percent ?? 0).toLocaleString('es-AR')}%`
          : `$${Math.abs(input.amount ?? 0).toLocaleString('es-AR')}`
      const description = `${positive ? 'Aumento' : 'Reducción'} de ${magnitude}`
      return {
        id: `pc-${Date.now()}`,
        date: todayISO(),
        providerId: input.providerId,
        description,
        changeType: input.changeType,
        percent: input.changeType === 'Porcentaje' ? input.percent : null,
        amount: input.changeType === 'Monto fijo' ? input.amount : null,
        affectedCount: details.length,
        user: 'Administrador',
        details,
      }
    }

    return {
      state,
      addSale: (input) => {
        const sale = buildSale(input, state.nextSaleNumber)
        dispatch({ type: 'ADD_SALE', sale })
        return sale
      },
      setSaleStatus: (saleId, status) => dispatch({ type: 'SET_SALE_STATUS', saleId, status }),
      addProduct: (product) => dispatch({ type: 'ADD_PRODUCT', product }),
      updateProduct: (product) => dispatch({ type: 'UPDATE_PRODUCT', product }),
      toggleProductStatus: (productId) => dispatch({ type: 'TOGGLE_PRODUCT_STATUS', productId }),
      applyPriceChange: (input) => {
        const change = buildPriceChange(input)
        dispatch({ type: 'APPLY_PRICE_CHANGE', change })
        return change
      },
      addProvider: (provider) => dispatch({ type: 'ADD_PROVIDER', provider }),
      updateProvider: (provider) => dispatch({ type: 'UPDATE_PROVIDER', provider }),
      toggleProviderStatus: (providerId) => dispatch({ type: 'TOGGLE_PROVIDER_STATUS', providerId }),
      addClient: (client) => dispatch({ type: 'ADD_CLIENT', client }),
      updateClient: (client) => dispatch({ type: 'UPDATE_CLIENT', client }),
      toggleClientStatus: (clientId) => dispatch({ type: 'TOGGLE_CLIENT_STATUS', clientId }),
      updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
      resetData: () => {
        localStorage.removeItem(STORAGE_KEY)
        window.location.reload()
      },
    }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
