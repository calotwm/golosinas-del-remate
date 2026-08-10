import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SalesHistory from './pages/SalesHistory'
import NewSale from './pages/NewSale'
import Products from './pages/Products'
import Providers from './pages/Providers'
import ProviderDetail from './pages/ProviderDetail'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import PriceUpdate from './pages/PriceUpdate'
import PriceHistory from './pages/PriceHistory'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ventas" element={<SalesHistory />} />
        <Route path="/ventas/nueva" element={<NewSale />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/proveedores" element={<Providers />} />
        <Route path="/proveedores/:id" element={<ProviderDetail />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/clientes/:id" element={<ClientDetail />} />
        <Route path="/precios" element={<PriceUpdate />} />
        <Route path="/precios/historial" element={<PriceHistory />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
