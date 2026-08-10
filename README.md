# Golosinas del Remate — Sistema de Gestión Mayorista

Prototipo visual de un sistema web de gestión para un mayorista de golosinas. Interfaz profesional de escritorio, con datos ficticios realistas y navegación e interacciones simuladas entre pantallas, pensada para demostrarle al cliente cómo sería el sistema terminado.

## Demo

- **Producción (Railway):** https://golosinas-del-remate-production.up.railway.app
- **Repositorio:** https://github.com/calotwm/golosinas-del-remate

## Módulos

| Módulo | Descripción |
|---|---|
| Dashboard | Indicadores del día/semana/mes, gráficos de ventas y últimas ventas |
| Ventas | Registro de nueva venta (búsqueda por nombre o código de barras, snapshot de precios) e historial con filtros |
| Productos | Catálogo con búsqueda, filtros por proveedor/marca/categoría, alta, edición, detalle y desactivación |
| Proveedores | Administración de proveedores y detalle con sus productos |
| Clientes | Administración de clientes e historial de compras |
| Actualización de precios | Aumentos/reducciones masivas por proveedor o por selección, con vista previa y confirmación |
| Historial de precios | Registro de modificaciones con detalle de precios anterior/nuevo por producto |
| Reportes | Ventas diarias/semanales/mensuales, por cliente/producto/proveedor, más vendidos y facturación por período |
| Configuración | Datos del negocio y preferencias |

## Regla de precios

Cada venta guarda el **precio unitario utilizado al momento de la venta** (snapshot). Los aumentos de precios posteriores solo afectan ventas futuras, nunca las ya registradas.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- React Router 7
- Recharts (gráficos)
- Express 5 (servidor estático para producción)
- Datos ficticios persistidos en `localStorage`

## Desarrollo

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm start        # sirve dist/ en http://localhost:3000
```
