# Golosinas del Remate — Sistema de Gestión Mayorista

Prototipo visual de un sistema web de gestión para un mayorista de golosinas, con el **template UrquiSoft** (dark high-contrast design system). Interfaz profesional, datos ficticios realistas y navegación e interacciones simuladas, pensada para demostrarle al cliente cómo sería el sistema terminado.

## Demo

- **Producción (Railway):** https://golosinas-del-remate-production.up.railway.app
- **Repositorio:** https://github.com/calotwm/golosinas-del-remate

## Módulos

| Módulo | Descripción |
|---|---|
| Menu principal | Pantalla de inicio simple con acceso rápido a los módulos |
| Ventas | Registro de nueva venta (búsqueda de producto por nombre o código de barras, solo producto y monto, sin cliente) e historial con filtros |
| Actualización de precios | Aumentos/reducciones masivas por proveedor o por selección, con vista previa y confirmación. Incluye pestaña de historial de cambios |
| Proveedores | Administración de proveedores y detalle con sus productos (costo, margen, precio de venta) |
| Reportes | Ventas por período (tabla + gráfico) y productos más vendidos |

## Regla de precios

Cada venta guarda el **precio unitario utilizado al momento de la venta** (snapshot). Los aumentos de precios posteriores solo afectan ventas futuras, nunca las ya registradas.

## Diseño (template UrquiSoft)

- Canvas negro puro, superficies elevadas con bordes hairline, sin sombras
- Acento rojo usado con moderación (acciones primarias, navegación activa)
- Tipografía Space Grotesk (títulos) + Inter (cuerpo)
- Botones pill, tarjetas redondeadas, grano fílmico sutil
- Gráficos y tablas adaptados al dark theme

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (tokens en `src/index.css` `@theme`)
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
