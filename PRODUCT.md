# Producto

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El dueño o administrador de un mayorista de golosinas (y su personal de mostrador). Trabaja en el negocio, en horario comercial, desde una PC de escritorio con pantalla amplia; necesita registrar ventas rápido y mantener los precios actualizados sin errores.

## Product Purpose

Sistema de gestión para un mayorista de golosinas: registrar ventas, generar factura PDF, actualizar precios de forma masiva y consultar reportes. El éxito es que el comerciante pueda operar el día a día (vender, reponer, ajustar precios) en un solo lugar y con datos confiables.

## Positioning

Es una demo de producto: un prototipo visual con datos ficticios realistas que demuestra cómo sería el sistema terminado al cliente. La "factura" no es fiscal: es una vista tipo factura que muestra los datos del negocio y el detalle de la venta.

## Operating Context

- Módulos: Menú principal, Ventas (nueva venta + historial + factura PDF), Actualización de precios (masiva con vista previa + historial), Proveedores (con detalle de productos), Reportes (ventas por período + productos más vendidos).
- Flujo clave: nueva venta busca producto por nombre o código de barras, arma el carrito y registra la venta con forma de pago. Los aumentos de precio posteriores nunca afectan ventas ya registradas (snapshot del precio unitario).
- Datos persistidos en `localStorage` (prototipo, sin backend real).
- Idioma de la interfaz: español rioplatense (Argentina), moneda ARS.

## Capabilities and Constraints

- Venta sin cliente obligatorio (solo producto, cantidad y monto).
- Factura PDF generada con jsPDF: banda de identificación, número de venta, fecha, forma de pago, detalle con cantidades, precios unitarios y subtotales, fila TOTAL.
- Actualización de precios por porcentaje o monto fijo, por proveedor o por selección, con vista previa y confirmación.
- Reportes con gráficos (Recharts).
- Restricción de prototipo: todo es simulado; no hay autenticación real, ni persistencia server-side, ni integraciones.

## Brand Commitments

- Nombre: "Golosinas del Remate".
- Paleta fijada por el cliente (obligatoria): `#c53d24` (terracota), `#a01e1c` (borgoña), `#e9d4d1` (rosa pálido), `#f7fbf3` (crema), `#fc893d` (naranja).
- Tema claro y cálido, estética de golosinería (decisión confirmada en esta sesión).

## Evidence on Hand

- README.md del repo documenta módulos, regla de precios y factura PDF.
- `src/data/mockData.ts` contiene productos/proveedores ficticios realistas (marcas reales como Arcor, Guaymallén, Bagley).
- No hay testimonios, casos reales, ni datos de producción; no inventar métricas ni claims comerciales.

## Product Principles

1. Operar el negocio rápido: registrar una venta no puede llevar más de unos segundos.
2. Los precios son sagrados: la regla de snapshot de precios protege la historia de ventas.
3. Claridad de datos por encima de decoración: tablas y reportes legibles de un vistazo.
4. Consistencia en todo el sistema: un solo lenguaje visual de componentes.
5. El prototipo debe sentirse terminado para vender la idea al cliente.

## Accessibility & Inclusion

Interfaz en español; operada por personal que puede estar de pie en un mostrador (buen contraste, targets táctiles razonables, keyboard focus visible).
