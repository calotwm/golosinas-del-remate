import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import MenuPrincipal from './pages/MenuPrincipal'
import SalesHistory from './pages/SalesHistory'
import NewSale from './pages/NewSale'
import Providers from './pages/Providers'
import ProviderDetail from './pages/ProviderDetail'
import PriceUpdate from './pages/PriceUpdate'
import Reports from './pages/Reports'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MenuPrincipal />} />
        <Route path="/ventas" element={<SalesHistory />} />
        <Route path="/ventas/nueva" element={<NewSale />} />
        <Route path="/proveedores" element={<Providers />} />
        <Route path="/proveedores/:id" element={<ProviderDetail />} />
        <Route path="/precios" element={<PriceUpdate />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
