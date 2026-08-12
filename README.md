# Golosinas del Remate — Sistema de Gestión Mayorista

Prototipo visual de un sistema web de gestión para un mayorista de golosinas, con estética **"remate argentino"** (tema claro y cálido). Interfaz profesional, datos ficticios realistas y navegación e interacciones simuladas, pensada para demostrarle al cliente cómo sería el sistema terminado.

## Demo

- **Producción (Railway):** https://golosinas-del-remate-production.up.railway.app
- **Repositorio:** https://github.com/calotwm/golosinas-del-remate

## Módulos

| Módulo | Descripción |
|---|---|
| Menu principal | Pantalla de inicio simple con acceso rápido a los módulos |
| Ventas | Registro de nueva venta (búsqueda de producto por nombre o código de barras, solo producto y monto, sin cliente), historial con filtros e **impresión de factura PDF** (productos, precios, monto y forma de pago) |
| Actualización de precios | Aumentos/reducciones masivas por proveedor o por selección, con vista previa y confirmación. Incluye pestaña de historial de cambios |
| Proveedores | Administración de proveedores y detalle con sus productos (costo, margen, precio de venta) |
| Reportes | Ventas por período (tabla + gráfico) y productos más vendidos |

## Regla de precios

Cada venta guarda el **precio unitario utilizado al momento de la venta** (snapshot). Los aumentos de precios posteriores solo afectan ventas futuras, nunca las ya registradas.

## Factura PDF

Al registrar una venta (y desde el historial), se puede generar un **PDF tipo factura**: banda roja con razón social y datos del negocio, número de venta, fecha, forma de pago, detalle de productos con cantidades, precios unitarios y subtotales, y fila TOTAL.

## Diseño (mundo "remate argentino")

- Canvas crema (#f7fbf3), superficies de papel rosa pálido (#e9d4d1) y blanco cremoso (#fffdf8)
- Paleta cálida: terracota (#c53d24) acciones primarias, borgoña (#a01e1c) profundidad/peligro, naranja (#fc893d) reservado para alertas de cambio de precio
- Tipografía Anton (display) + Inter (cuerpo)
- Botones pill, tarjetas papel redondeadas (20px), sombras suaves difuminadas, sin glass ni grano
- Gráficos y tablas adaptados al tema claro; sistema documentado en `PRODUCT.md` y `DESIGN.md`

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
