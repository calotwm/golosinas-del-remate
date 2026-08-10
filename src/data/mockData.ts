import type {
  AppData,
  Client,
  PaymentMethod,
  PriceChange,
  PriceChangeType,
  Product,
  Provider,
  Sale,
  SaleItem,
} from '../types'
import { round2 } from '../utils/format'

export const STORAGE_KEY = 'golosinas-del-remate:data:v1'

export const CATEGORIES = [
  'Chocolates',
  'Alfajores',
  'Caramelos',
  'Gomitas',
  'Chicles',
  'Galletitas',
  'Turrones',
  'Barritas',
  'Obleas',
  'Mentas',
] as const

const dateDaysAgo = (days: number) => {
  const d = new Date(2026, 7, 10)
  d.setDate(d.getDate() - days)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(20260810)

const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const round = (n: number, d: number = 0) => Number(n.toFixed(d))

function makeProviders(): Provider[] {
  const base = [
    ['arcor', 'Arcor', '30-50001111-9'],
    ['guaymallen', 'Guaymallén', '30-51111111-3'],
    ['bagley', 'Bagley', '30-52000001-1'],
    ['terrabusi', 'Terrabusi', '30-52001111-8'],
    ['dos-en-uno', 'Dos en Uno', '30-71001111-2'],
  ] as const
  return base.map(([id, name, cuit]) => ({
    id,
    name,
    cuit,
    phone: `011-4${randInt(100, 999)}-${randInt(1000, 9999)}`,
    email: `ventas@${id.toLowerCase()}.com.ar`,
    status: 'Activo' as const,
  }))
}

type Spec = [name: string, brand: string, providerId: string, category: string, cost: number, margin: number]

const PRODUCT_SPECS: Spec[] = [
  // Arcor — Chocolates
  ['Bon o Bon x27', 'Bon o Bon', 'arcor', 'Chocolates', 4291.67, 20],
  ['Bon o Bon x9', 'Bon o Bon', 'arcor', 'Chocolates', 1516.67, 20],
  ['Bon o Bon Coco x27', 'Bon o Bon', 'arcor', 'Chocolates', 4333.33, 20],
  ['Cofler Block x20', 'Cofler', 'arcor', 'Chocolates', 7000, 22],
  ['Cofler Leche y Avellanas x20', 'Cofler', 'arcor', 'Chocolates', 7333.33, 20],
  ['Whisper x24', 'Whisper', 'arcor', 'Chocolates', 4583.33, 20],
  ['Tita x12', 'Tita', 'arcor', 'Chocolates', 3791.67, 20],
  ['Tita x24', 'Tita', 'arcor', 'Chocolates', 7333.33, 20],
  ['Arcor Box Chocolate x100g', 'Arcor', 'arcor', 'Chocolates', 1583.33, 20],
  ['Arcor Tableta Chocolate con Leche', 'Arcor', 'arcor', 'Chocolates', 1333.33, 20],
  ['Arcor Tableta Chocolate Blanco', 'Arcor', 'arcor', 'Chocolates', 1333.33, 18],
  ['Arcor Tableta Chocolate Amargo', 'Arcor', 'arcor', 'Chocolates', 1416.67, 18],
  ['Arcor Bombones Rellenos x120g', 'Arcor', 'arcor', 'Chocolates', 3416.67, 20],
  ['Arcor Huevos de Chocolate x30', 'Arcor', 'arcor', 'Chocolates', 6250, 20],

  // Arcor — Alfajores
  ['Alfajor Arcor', 'Arcor', 'arcor', 'Alfajores', 858.33, 20],
  ['Alfajor Arcor Blanco', 'Arcor', 'arcor', 'Alfajores', 875, 20],
  ['Alfajor Arcor x24', 'Arcor', 'arcor', 'Alfajores', 14916.67, 20],
  ['Alfajor Triki x24', 'Triki', 'arcor', 'Alfajores', 11458.33, 20],
  ['Alfajor Fantoche x24', 'Fantoche', 'arcor', 'Alfajores', 12666.67, 20],
  ['Alfajor Fantoche Relleno Chocolate x24', 'Fantoche', 'arcor', 'Alfajores', 13166.67, 20],
  ['Alfajor Fantoche Mini x24', 'Fantoche', 'arcor', 'Alfajores', 9166.67, 20],
  ['Alfajor Arcor Coco x24', 'Arcor', 'arcor', 'Alfajores', 12000, 20],

  // Arcor — Caramelos
  ['Butter Toffees x250g', 'Butter Toffees', 'arcor', 'Caramelos', 1916.67, 20],
  ['Butter Toffees x1kg', 'Butter Toffees', 'arcor', 'Caramelos', 6208.33, 20],
  ['Butter Toffees Sabor a Crema x500g', 'Butter Toffees', 'arcor', 'Caramelos', 3416.67, 20],
  ['Butter Toffees Menta x500g', 'Butter Toffees', 'arcor', 'Caramelos', 3500, 20],
  ['Caramelos Menta Limit x100g', 'Menta Limit', 'arcor', 'Caramelos', 1583.33, 20],
  ['Caramelos Frutales Limit x100g', 'Limit', 'arcor', 'Caramelos', 1458.33, 20],
  ['Caramelos Topline x24', 'Topline', 'arcor', 'Caramelos', 1375, 20],
  ['Caramelos Big Time x24', 'Big Time', 'arcor', 'Caramelos', 1350, 22],
  ['Caramelos Big Time Menta x24', 'Big Time', 'arcor', 'Caramelos', 1375, 20],
  ['Caramelos Surtidos Arcor x500g', 'Arcor', 'arcor', 'Caramelos', 3000, 20],
  ['Caramelos Surtidos Arcor x1kg', 'Arcor', 'arcor', 'Caramelos', 5833.33, 20],
  ['Caramelos Ácidos Arcor x250g', 'Arcor', 'arcor', 'Caramelos', 2333.33, 20],

  // Arcor — Gomitas
  ['Mogul x24', 'Mogul', 'arcor', 'Gomitas', 2000, 20],
  ['Mogul x50', 'Mogul', 'arcor', 'Gomitas', 3333.33, 20],
  ['Mogul Frutilla x24', 'Mogul', 'arcor', 'Gomitas', 2041.67, 20],
  ['Mogul Cítricos x24', 'Mogul', 'arcor', 'Gomitas', 2041.67, 20],
  ['Mogul Oso x100g', 'Mogul', 'arcor', 'Gomitas', 1750, 20],
  ['Mogul Mix x250g', 'Mogul', 'arcor', 'Gomitas', 3083.33, 20],
  ['Gomitas Ácidas Arcor x100g', 'Arcor', 'arcor', 'Gomitas', 1291.67, 20],
  ['Gomitas Vinilo x24', 'Vinilo', 'arcor', 'Gomitas', 1583.33, 20],

  // Arcor — Chicles
  ['Chicle Beldent x12', 'Beldent', 'arcor', 'Chicles', 1875, 20],
  ['Chicle Beldent Menta x12', 'Beldent', 'arcor', 'Chicles', 1875, 20],
  ['Chicle Beldent Cereza x12', 'Beldent', 'arcor', 'Chicles', 1875, 20],
  ['Chicle Beldent Hielo x12', 'Beldent', 'arcor', 'Chicles', 1908.33, 20],
  ['Chicle Big Time Fresa x12', 'Big Time', 'arcor', 'Chicles', 1416.67, 20],
  ['Chicle Big Time Sandía x12', 'Big Time', 'arcor', 'Chicles', 1416.67, 20],
  ['Chicle Big Time Menta x12', 'Big Time', 'arcor', 'Chicles', 1416.67, 20],
  ['Chicle Beldent x24', 'Beldent', 'arcor', 'Chicles', 3666.67, 20],
  ['Chicle Bazooka x12', 'Bazooka', 'arcor', 'Chicles', 1250, 20],
  ['Chicle Bazooka x24', 'Bazooka', 'arcor', 'Chicles', 2458.33, 20],

  // Arcor — Turrones y Barritas
  ['Turrón Arcor', 'Arcor', 'arcor', 'Turrones', 751.04, 20],
  ['Turrón Arcor x30', 'Arcor', 'arcor', 'Turrones', 13750, 20],
  ['Turrón Arcor Blando x24', 'Arcor', 'arcor', 'Turrones', 9333.33, 20],
  ['Turrón Maní Arcor x30', 'Arcor', 'arcor', 'Turrones', 9666.67, 20],
  ['Turrón de Nuez Arcor x12', 'Arcor', 'arcor', 'Turrones', 9333.33, 20],
  ['Barrita Arcor Cereal x18', 'Arcor', 'arcor', 'Barritas', 3083.33, 20],
  ['Barrita Arcor Maní x18', 'Arcor', 'arcor', 'Barritas', 3083.33, 20],
  ['Barrita Arcor Chocolate x18', 'Arcor', 'arcor', 'Barritas', 3125, 20],
  ['Barrita Arcor Naranja x18', 'Arcor', 'arcor', 'Barritas', 3000, 20],

  // Arcor — Mentas y diversos
  ['Menthoplus x120g', 'Menthoplus', 'arcor', 'Mentas', 1750, 20],
  ['Menthoplus x240g', 'Menthoplus', 'arcor', 'Mentas', 3083.33, 20],
  ['Menthoplus Sin Azúcar x120g', 'Menthoplus', 'arcor', 'Mentas', 1833.33, 20],
  ['Media Hora Menta x24', 'Media Hora', 'arcor', 'Mentas', 1416.67, 20],
  ['Media Hora Limón x24', 'Media Hora', 'arcor', 'Mentas', 1416.67, 20],
  ['Media Hora Menta x90', 'Media Hora', 'arcor', 'Mentas', 3791.67, 20],
  ['Mentitas Menta Fuente x100g', 'Mentitas', 'arcor', 'Mentas', 1166.67, 20],
  ['Surtido Golosinas Arcor x1kg', 'Arcor', 'arcor', 'Caramelos', 4583.33, 20],
  ['Surtido Golosinas Arcor x3kg', 'Arcor', 'arcor', 'Caramelos', 12500, 20],
  ['Chocolate en Polvo Arcor x200g', 'Arcor', 'arcor', 'Chocolates', 1750, 20],
  ['Cacao Arcor x400g', 'Arcor', 'arcor', 'Chocolates', 2916.67, 20],
  ['Leche en Polvo Chocolatada Arcor x500g', 'Arcor', 'arcor', 'Chocolates', 4583.33, 20],
  ['Golosina Acida Rex Prim x90g', 'Rex Prim', 'arcor', 'Gomitas', 1541.67, 20],
  ['Golosina Acida Rex Prim x200g', 'Rex Prim', 'arcor', 'Gomitas', 2833.33, 20],

  // Guaymallén — Alfajores
  ['Alfajor Guaymallén clásico', 'Guaymallén', 'guaymallen', 'Alfajores', 500, 25],
  ['Alfajor Guaymallén blanco', 'Guaymallén', 'guaymallen', 'Alfajores', 500, 25],
  ['Alfajor Guaymallén negro', 'Guaymallén', 'guaymallen', 'Alfajores', 500, 25],
  ['Alfajor Guaymallén fruta', 'Guaymallén', 'guaymallen', 'Alfajores', 520, 25],
  ['Alfajor Guaymallén glaseado', 'Guaymallén', 'guaymallen', 'Alfajores', 520, 25],
  ['Alfajor Guaymallén triple', 'Guaymallén', 'guaymallen', 'Alfajores', 620, 25],
  ['Alfajor Guaymallén blanco triple', 'Guaymallén', 'guaymallen', 'Alfajores', 620, 25],
  ['Alfajor Guaymallén negro triple', 'Guaymallén', 'guaymallen', 'Alfajores', 620, 25],
  ['Alfajor Guaymallén clásico x24', 'Guaymallén', 'guaymallen', 'Alfajores', 9000, 25],
  ['Alfajor Guaymallén mini x24', 'Guaymallén', 'guaymallen', 'Alfajores', 6200, 25],
  ['Alfajor Guaymallén cacao x24', 'Guaymallén', 'guaymallen', 'Alfajores', 9200, 25],
  ['Alfajor Guaymallén glaseado x24', 'Guaymallén', 'guaymallen', 'Alfajores', 9300, 25],

  // Bagley — Galletitas
  ['Galletitas Criollitas x250g', 'Criollitas', 'bagley', 'Galletitas', 1708.33, 20],
  ['Galletitas Criollitas x500g', 'Criollitas', 'bagley', 'Galletitas', 3250, 20],
  ['Galletitas Criollitas Integrales x250g', 'Criollitas', 'bagley', 'Galletitas', 1750, 20],
  ['Surtido Bagley x300g', 'Bagley', 'bagley', 'Galletitas', 2208.33, 20],
  ['Surtido Bagley x600g', 'Bagley', 'bagley', 'Galletitas', 4208.33, 20],
  ['Chocolinas x400g', 'Chocolinas', 'bagley', 'Galletitas', 3166.67, 20],
  ['Chocolinas Rellenas x350g', 'Chocolinas', 'bagley', 'Galletitas', 3500, 20],
  ['Chocolinas x200g', 'Chocolinas', 'bagley', 'Galletitas', 1833.33, 20],
  ['Galletitas Vainillas x220g', 'Vainillas', 'bagley', 'Galletitas', 1416.67, 20],
  ['Galletitas Merengadas x150g', 'Merengadas', 'bagley', 'Galletitas', 1125, 20],
  ['Galletitas Chocolinas Minis x150g', 'Chocolinas', 'bagley', 'Galletitas', 1833.33, 20],
  ['Galletitas Criollitas x1kg', 'Criollitas', 'bagley', 'Galletitas', 5833.33, 20],
  ['Galletitas Rumba x200g', 'Rumba', 'bagley', 'Galletitas', 1833.33, 20],
  ['Galletitas Rumba Chocolate x200g', 'Rumba', 'bagley', 'Galletitas', 1875, 20],
  ['Galletitas Agua Bagley x250g', 'Bagley', 'bagley', 'Galletitas', 1541.67, 20],
  ['Galletitas Bolsitas x160g', 'Bolsitas', 'bagley', 'Galletitas', 1250, 20],

  // Terrabusi — Galletitas
  ['Galletitas Terrabusi dulces x300g', 'Terrabusi', 'terrabusi', 'Galletitas', 2291.67, 20],
  ['Galletitas Terrabusi chispas de chocolate x300g', 'Terrabusi', 'terrabusi', 'Galletitas', 2458.33, 20],
  ['Galletitas Lengüitas x200g', 'Lengüitas', 'terrabusi', 'Galletitas', 1333.33, 20],
  ['Galletitas Tapitas x180g', 'Tapitas', 'terrabusi', 'Galletitas', 1416.67, 20],
  ['Galletitas Surtido Terrabusi x400g', 'Terrabusi', 'terrabusi', 'Galletitas', 3333.33, 20],
  ['Galletitas Terrabusi aguila x250g', 'Terrabusi', 'terrabusi', 'Galletitas', 2000, 20],
  ['Galletitas Chocolate Terrabusi x250g', 'Terrabusi', 'terrabusi', 'Galletitas', 2208.33, 20],
  ['Snack Jack Rezada x90g', 'Jack', 'terrabusi', 'Galletitas', 1583.33, 20],
  ['Snack Jack Queso x90g', 'Jack', 'terrabusi', 'Galletitas', 1583.33, 20],
  ['Snack Jack Nacho x90g', 'Jack', 'terrabusi', 'Galletitas', 1608.33, 20],
  ['Galletitas Terrabusi tostadas x250g', 'Terrabusi', 'terrabusi', 'Galletitas', 1875, 20],
  ['Galletitas Terrabusi criollas x250g', 'Terrabusi', 'terrabusi', 'Galletitas', 1750, 20],
  ['Galletitas Linzer x150g', 'Linzer', 'terrabusi', 'Galletitas', 1375, 20],
  ['Galletitas Manon Rellenas x200g', 'Manon', 'terrabusi', 'Galletitas', 1708.33, 20],
  ['Galletitas Dulce Terrabusi x500g', 'Terrabusi', 'terrabusi', 'Galletitas', 3458.33, 20],

  // Dos en Uno — Turrones y Obleas
  ['Turrón Dos en Uno Maní x30', 'Dos en Uno', 'dos-en-uno', 'Turrones', 3708.33, 25],
  ['Turrón Dos en Uno Semilla x30', 'Dos en Uno', 'dos-en-uno', 'Turrones', 3958.33, 25],
  ['Turrón Dos en Uno Almendras x30', 'Dos en Uno', 'dos-en-uno', 'Turrones', 4375, 25],
  ['Obleas Dos en Uno x24', 'Dos en Uno', 'dos-en-uno', 'Obleas', 1500, 25],
  ['Obleas Dos en Uno Cacao x24', 'Dos en Uno', 'dos-en-uno', 'Obleas', 1625, 25],
  ['Turrón Dos en Uno Chocolate x30', 'Dos en Uno', 'dos-en-uno', 'Turrones', 4000, 25],
  ['Obleas Dos en Uno Bañadas x24', 'Dos en Uno', 'dos-en-uno', 'Obleas', 1708.33, 25],
  ['Turrón Dos en Uno Fruta x30', 'Dos en Uno', 'dos-en-uno', 'Turrones', 3916.67, 25],
]

function makeProducts(): Product[] {
  return PRODUCT_SPECS.map(([name, brand, providerId, category, cost, margin], i) => ({
      id: `prod-${i + 1}`,
      code: `7790${String(randInt(10000000, 99999999))}`.padEnd(13, '7'),
      name,
      brand,
      providerId,
      category,
      cost: round(cost, 2),
      margin,
      price: round2(round(cost, 2) * (1 + margin / 100)),
      status: 'Activo',
    }),
  )
}

function makeClients(): Client[] {
  const base: Array<[string, string]> = [
    ['Almacén Don José', 'Av. Corrientes 1234'],
    ['Kiosco La Esquina', 'Av. Santa Fe 2501'],
    ['Maxikiosco El Progreso', 'Av. Rivadavia 5100'],
    ['Almacén Doña Rosa', 'Av. San Martín 3450'],
    ['Autoservicio San Martín', 'Av. Gaona 1800'],
    ['Kiosco El Vecino', 'Av. Cabildo 6200'],
    ['Almacén Los Amigos', 'Av. La Plata 2100'],
    ['Maxikiosco 24 Horas', 'Av. General Paz 8800'],
    ['Kiosco La Estación', 'Av. Triunvirato 4200'],
    ['Almacén Sol de Mayo', 'Av. Córdoba 3100'],
    ['Kiosco El Pibe', 'Av. Boedo 1120'],
    ['Autoservicio La Amistad', 'Av. Juan B. Justo 4400'],
    ['Kiosco Don Tito', 'Av. Independencia 1580'],
    ['Almacén Mi Barrio', 'Av. Nazca 2900'],
    ['Maxikiosco La Central', 'Av. Hipólito Yrigoyen 7100'],
  ]
  return base.map(([name, address], i) => ({
    id: `cli-${i + 1}`,
    name,
    cuit: `20-${randInt(10000000, 39999999)}-${randInt(0, 9)}`,
    phone: `011-${randInt(2, 9)}${randInt(100, 999)}-${randInt(1000, 9999)}`,
    address,
    email: `contacto@${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com.ar`,
    paymentCondition: pick(['Contado', 'Contado', 'Contado', '30 días', '30 días', '60 días']),
    status: 'Activo',
  }))
}

function makePriceChanges(products: Product[]): PriceChange[] {
  const specs: Array<{
    providerId: string
    daysAgo: number
    changeType: PriceChangeType
    percent?: number
    amount?: number
  }> = [
    { providerId: 'guaymallen', daysAgo: 26, changeType: 'Porcentaje', percent: 4 },
    { providerId: 'bagley', daysAgo: 19, changeType: 'Porcentaje', percent: 2.5 },
    { providerId: 'terrabusi', daysAgo: 13, changeType: 'Porcentaje', percent: -5 },
    { providerId: 'dos-en-uno', daysAgo: 6, changeType: 'Monto fijo', amount: 1200 },
    { providerId: 'arcor', daysAgo: 0, changeType: 'Porcentaje', percent: 3 },
  ]

  return specs.map((spec, idx) => {
    const affected = products.filter((p) => p.providerId === spec.providerId)
    const details = affected.map((p) => {
      let oldPrice: number
      if (spec.changeType === 'Porcentaje') {
        oldPrice = round2(p.price / (1 + (spec.percent ?? 0) / 100))
      } else {
        oldPrice = round2(p.price - (spec.amount ?? 0))
      }
      return { productId: p.id, productName: p.name, oldPrice, newPrice: p.price }
    })
    const isPositive =
      spec.changeType === 'Porcentaje' ? (spec.percent ?? 0) > 0 : (spec.amount ?? 0) > 0
    const label =
      spec.changeType === 'Porcentaje'
        ? `${isPositive ? 'Aumento' : 'Reducción'} del ${Math.abs(spec.percent ?? 0).toLocaleString('es-AR')}%`
        : `${isPositive ? 'Aumento' : 'Reducción'} de $${Math.abs(spec.amount ?? 0).toLocaleString('es-AR')}`
    return {
      id: `pc-${idx + 1}`,
      date: dateDaysAgo(spec.daysAgo),
      providerId: spec.providerId,
      description: label,
      changeType: spec.changeType,
      percent: spec.changeType === 'Porcentaje' ? (spec.percent ?? 0) : null,
      amount: spec.changeType === 'Monto fijo' ? (spec.amount ?? 0) : null,
      affectedCount: affected.length,
      user: 'Administrador',
      details,
    }
  })
}

function makeSales(products: Product[], clients: Client[], priceChanges: PriceChange[]): Sale[] {
  const priceAtDate = (product: Product, dateISO: string): number => {
    let price = product.price
    for (const pc of priceChanges) {
      if (pc.date > dateISO && pc.providerId === product.providerId) {
        if (pc.changeType === 'Porcentaje') {
          price = round2(price / (1 + (pc.percent ?? 0) / 100))
        } else {
          price = round2(price - (pc.amount ?? 0))
        }
      }
    }
    return price
  }

  const activeProducts = products.filter((p) => p.status === 'Activo')
  const activeClients = clients.filter((c) => c.status === 'Activo')
  const paymentMethods: Array<PaymentMethod> = [
    'Efectivo',
    'Efectivo',
    'Efectivo',
    'Efectivo',
    'Efectivo',
    'Transferencia',
    'Transferencia',
    'Transferencia',
    'Cuenta corriente',
    'Cuenta corriente',
  ]
  const schedule: number[] = []
  const add = (day: number, count: number) => {
    for (let k = 0; k < count; k++) schedule.push(day)
  }
  add(0, 5)
  add(1, 4)
  for (let day = 2; day <= 14; day++) add(day, 3)
  for (let day = 15; day <= 29; day++) add(day, 2)

  const sales: Sale[] = []
  let number = 1001
  schedule.forEach((day, i) => {
    const client = pick(activeClients)
    const used = new Map<string, number>()
    const count = randInt(1, 15)
    for (let k = 0; k < count; k++) {
      const product = pick(activeProducts)
      used.set(product.id, (used.get(product.id) ?? 0) + randInt(1, 8))
    }
    const items: SaleItem[] = [...used.entries()].map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId)
      const name = product?.name ?? 'Producto'
      return {
        productId,
        productName: name,
        unitPrice: round2(product ? priceAtDate(product, dateDaysAgo(day)) : 0),
        quantity,
        subtotal: 0,
      }
    })
    items.forEach((it) => {
      it.subtotal = round2(it.unitPrice * it.quantity)
    })
    const total = round2(items.reduce((acc, it) => acc + it.subtotal, 0))
    sales.push({
      id: `sal-${i + 1}`,
      number,
      date: dateDaysAgo(day),
      clientId: client.id,
      items,
      total,
      paymentMethod: pick(paymentMethods),
      status: rng() < 0.92 ? 'Completada' : 'Anulada',
    })
    number += 1
  })
  return sales
}

export function buildMockData(): AppData {
  const providers = makeProviders()
  const products = makeProducts()
  const clients = makeClients()
  const priceChanges = makePriceChanges(products)
  const sales = makeSales(products, clients, priceChanges)
  return {
    providers,
    products,
    clients,
    sales,
    priceChanges,
    settings: {
      businessName: 'Golosinas del Remate',
      cuit: '30-70431729-5',
      address: 'Av. Hipólito Yrigoyen 9200, Lomas de Zamora, Buenos Aires',
      phone: '011-4244-9876',
      email: 'admin@golosinasdelremate.com.ar',
      user: 'Administrador',
      currency: 'ARS',
    },
  }
}
