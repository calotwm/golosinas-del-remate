---
name: Golosinas del Remate
description: Sistema de gestión mayorista de golosinas — mundo visual "remate argentino" (etiquetas de precio, crema cálida, terracota)
colors:
  primary: "#c53d24"
  primary-deep: "#a01e1c"
  accent: "#fc893d"
  accent-deep: "#b2550f"
  canvas: "#f7fbf3"
  surface-deep: "#e9d4d1"
  surface-elevated: "#fffdf8"
  ink: "#2a1512"
  ink-muted: "rgba(42, 21, 18, 0.72)"
  ink-dim: "rgba(42, 21, 18, 0.68)"
  ink-faint: "rgba(42, 21, 18, 0.55)"
  success: "#257a37"
  warning: "#b45309"
  danger: "#a01e1c"
  hairline-dark: "rgba(42, 21, 18, 0.12)"
  hairline-strong: "rgba(42, 21, 18, 0.22)"
typography:
  display:
    fontFamily: "Anton, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
rounded:
  card: "20px"
  input: "12px"
  pill: "9999px"
  table: "16px"
spacing:
  section: "32px"
  card-padding: "20px"
  grid-gap: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  card-paper:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  input-field:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
---

# Sistema de Diseño: Golosinas del Remate

## Overview

**Creative North Star: "El Remate de Precios"**

El sistema toma el lenguaje vernáculo del remate argentino — etiquetas de precio perforadas, carteles de oferta en marker, el papel crema del comercio de barrio — y lo convierte en una interfaz de gestión luminosa y directa. Nada de dark glass ni grano fílmico: la superficie es papel, la tinta es borgoña oscuro, y el color de la oferta (naranja) está reservado para los eventos que el operador no puede dejar pasar: cambios de precio.

El resultado se siente como una golosinería ordenada por un contador atento: cálido, legible de un vistazo, y con una sola voz tipográfica de oferta (Anton) para lo que tiene que gritar — el nombre de la marca, los títulos, los totales.

**Key Characteristics:**
- Fondo crema cálido (#f7fbf3) con superficies de papel rosa pálido (#e9d4d1) y blanco cremoso (#fffdf8)
- Terracota (#c53d24) como único color de acción primaria; borgoña (#a01e1c) para profundidad y peligro
- Naranja (#fc893d) reservado como alerta de cambio de precio — raro, por eso llama la atención
- Anton para display (condensado, de oferta), Inter para cuerpo (trabajo, legible)
- Formas pill y esquinas de 20px: etiquetas y tickets, no cajas técnicas
- Sin glassmorphism, sin grano, sin sombras duras: profundidad por sombras suaves difuminadas

## Colors

Paleta cálida heredada del mundo del remate: cremas y rosas como papel, terracota/borgoña como tinta de oferta, naranja como etiqueta de alerta.

### Primary
- **Terracota** (#c53d24): acciones primarias, navegación activa. Es la voz de "comprar/vender/guardar".
- **Borgoña Profundo** (#a01e1c): hover del primario, estados de peligro, banda del footer. La misma familia en un registro más grave.

### Accent
- **Naranja Remate** (#fc893d): SOLO eventos de cambio de precio y alertas de oferta. Su rareza es su poder.
- **Naranja Tinta** (#b2550f): el mismo naranja pero oscurecido para texto/iconos sobre fondo claro (≥4.5:1).

### Neutral
- **Crema** (#f7fbf3): canvas de la aplicación, fondo del body y del header.
- **Rosa Pálido** (#e9d4d1): superficies tintadas — sidebar, cabeceras de tabla, banda de la marca.
- **Blanco Cremoso** (#fffdf8): superficies elevadas — tarjetas, modales, inputs.
- **Tinta Borgoña** (#2a1512): texto principal sobre fondo claro.
- **Tinta media** (rgba(42,21,18,0.72)), **tinta baja** (0.68): jerarquía de texto secundaria y terciaria; ambas ≥4.5:1 para texto. **Tinta tenue** (0.55): solo para gráficos/decoración (≥3:1); no usar en texto pequeño — para eso usar ink-dim o ink-muted.
- **Hairline** (rgba(42,21,18,0.12) / 0.22): bordes y divisores cálidos, nunca gris frío.

**La Regla del Naranja Reservado.** El naranja #fc893d se usa en ≤2% de cualquier pantalla. Solo eventos de precio. Si aparece en otro lado, es un bug.

## Typography

**Display Font:** Anton (con fallback ui-sans-serif)
**Body Font:** Inter (con fallback ui-sans-serif)

**Carácter:** Anton es el marker del cartel de remate — condensado, alto, sin miedo — y se usa solo donde algo tiene que decirse fuerte: marca, títulos de página, valores de KPI. Inter hace el trabajo pesado: tablas, formularios, etiquetas.

### Hierarchy
- **Display** (Anton, ~1.25rem–2rem, line-height ~1.1): títulos de página, brand lockup, valores de StatCard. Letter-spacing -0.02em.
- **Body** (Inter 400/500, 14px, line-height ~1.5): la mayoría del contenido operativo. Máximo ~65–75ch en párrafos.
- **Label** (Inter 600, 11–12px, uppercase, tracking-wider): encabezados de sección, cabeceras de tabla, etiquetas de StatCard. Use la tinta tenue o media, nunca el naranja.

**La Regla del Gritar Poco.** Anton grita. Por eso solo marca, títulos y totales. Un párrafo en Anton es un cartel de oferta; el cuerpo en Inter es el negocio.

## Layout

Aplicación de gestión con shell de escritorio: sidebar fija (240px, rosa pálido) + header (64px, crema) + main scrollable (padding 24–32px) + footer banda terracota con texto blanco. En mobile (<1024px) la sidebar colapsa a un drawer scrim rgba(42,21,18,0.5).

Ritmo: secciones espaciadas 32px, tarjetas con padding interno 20px, gap de grillas 16px. Más aire arriba de cada heading que abajo. Densidad operativa en tablas (rows de 40px) pero con aire en pantallas de inicio y reportes.

## Elevation & Depth

Profundidad por **sombras suaves difuminadas** sobre papel — nunca sombras duras de bloque, nunca halos de color. La elevación responde al estado: en reposo es plana y cálida, al hover sube 1px con una sombra apenas más grande.

### Shadow Vocabulary
- **paper-card en reposo** (`box-shadow: inset 0 1px 0 0 rgba(255,253,248,0.9), 0 4px 16px -2px rgba(42,21,18,0.08), 0 1px 3px rgba(42,21,18,0.04)`): tarjetas, modales, chips.
- **paper-card hover** (`0 8px 24px -4px rgba(42,21,18,0.12), 0 2px 6px rgba(42,21,18,0.06)`): elevación al hover.

## Shapes

Lenguaje de **etiqueta y ticket**: esquinas grandes y generosas (20px en tarjetas, 12px en inputs, 16px en tablas) y pills totales en botones y navegación. Los bordes son hairlines cálidos de 1px (rgba(42,21,18,0.12)), nunca bordes coloreados de 2px+. Las tablas llevan una cabecera sticky con fondo rosa pálido y divisores hairline horizontales.

## Components

### Buttons
- **Shape:** pill (9999px), altura 32–36px.
- **Primary:** terracota (#c53d24), texto blanco, hover a borgoña (brightness) + scale 0.98 en active. Focus ring terracota al 40%.
- **Secondary:** transparente, borde hairline, tinta oscura; hover tinta terracota al 8%.
- **Danger:** borgoña (#a01e1c), texto blanco.
- **Ghost / Danger-ghost:** solo tinta; hover tint terracota.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** blanco cremoso (#fffdf8) — la clase `.paper-card`.
- **Shadow Strategy:** sombras suaves difuminadas del vocabulario de elevación; hover levanta la tarjeta 1px.
- **Border:** hairline cálido 1px.
- **Internal Padding:** 20px (5 en cabecera con título).

### Inputs / Fields
- **Style:** borde hairline 1px, fondo blanco cremoso, radio 12px, altura 36px, `color-scheme: light`.
- **Focus:** borde + ring terracota 1px.
- **Disabled:** opacidad 60%, cursor not-allowed.

### Navigation (Sidebar)
- **Style:** fondo rosa pálido; marca "GOLOSINAS DEL REMATE" en Anton con "Remate" en terracota.
- **Default:** tinta media; **hover:** tint terracota; **active:** pill terracota con texto blanco.
- **Mobile:** drawer con scrim cálido, botón hamburguesa en header.

### Badges / StatusBadge
- **Style:** pill con borde tintado y texto semántico (verde éxito #257a37, borgoña peligro, ámbar warning, azul/púrpura solo para info). Todos ajustados a ≥4.5:1 sobre claro.

### Tabla
- **Cabecera sticky:** rosa pálido, label uppercase 11px.
- **Rows:** divisores hairline, hover tint terracota al 5%, filas clickeables con focus-visible ring.

### Chips de cambio de precio (componente firma)
- **Sube:** icono/valor en Naranja Tinta (#b2550f) sobre tint naranja 10% — la "alerta que queda prendida" del mundo gate-board.
- **Baja:** verde éxito (#257a37). Un evento de precio, un color, en toda la app.

## Do's and Don'ts

### Do:
- **Do** usar naranja #fc893d SOLO para eventos de cambio de precio (Regla del Naranja Reservado).
- **Do** mantener el piso de contraste ≥4.5:1 para texto y ≥3:1 para elementos gráficos — los tokens `ink-dim` (0.68) y `ink-muted` (0.72) garantizan ≥4.5:1 para texto; `ink-faint` (0.55) es solo para gráficos/decoración (≥3:1).
- **Do** usar Anton únicamente para marca, títulos de página y valores de KPI.
- **Do** escribir los precios y totales con figuras tabulares legibles sobre blanco cremoso.
- **Do** reutilizar los tokens de tint (`hover-tint`, `row-tint`, `icon-tint`, `scrim`) en vez de rgba literales.

### Don't:
- **Don't** volver al dark glass, grano fílmico, ni sombras duras de bloque — el mundo es papel y luz.
- **Don't** usar text-gradients ni blur como decoración.
- **Don't** usar emoji como iconos ni mono como disfraz técnico.
- **Don't** nombrar tokens con `-on-dark` en un tema claro — los nombres de token deben decir la verdad (`ink`, `ink-muted`, `accent`).
- **Don't** inventar colores fuera de la paleta: cualquier hex nuevo debe ser la paleta o un derivado directo (alpha/hue oscurecido).
