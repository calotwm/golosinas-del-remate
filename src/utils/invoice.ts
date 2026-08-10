import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Sale, Settings } from '../types'
import { formatARS, formatDate } from './format'

const RED: [number, number, number] = [220, 38, 38]
const INK: [number, number, number] = [17, 24, 39]
const MUTED: [number, number, number] = [107, 114, 128]
const ZEBRA: [number, number, number] = [249, 250, 251]
const HAIRLINE: [number, number, number] = [229, 231, 235]
const NOTE: [number, number, number] = [156, 163, 175]
const WHITE: [number, number, number] = [255, 255, 255]
const MARGIN = 14

export function generateSaleInvoicePdf(sale: Sale, settings: Settings): void {
  if (!sale.items || sale.items.length === 0) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(...RED)
  doc.rect(0, 0, pageWidth, 40, 'F')

  const businessName = settings.businessName?.trim() || 'Golosinas del Remate'
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(businessName, MARGIN, 16)

  const detailLines = [
    settings.cuit ? `CUIT: ${settings.cuit}` : '',
    settings.address ? settings.address : '',
    settings.phone ? `Tel.: ${settings.phone}` : '',
  ].filter(Boolean)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  detailLines.forEach((line, i) => {
    doc.text(line, MARGIN, 23 + i * 6)
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('FACTURA', pageWidth - MARGIN, 16, { align: 'right' })
  doc.setFontSize(11)
  doc.text(`Nº ${String(sale.number).padStart(6, '0')}`, pageWidth - MARGIN, 26, { align: 'right' })
  doc.text(`Fecha: ${formatDate(sale.date)}`, pageWidth - MARGIN, 33, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Cliente:', MARGIN, 52)
  doc.text('Forma de pago:', MARGIN, 59)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...INK)
  doc.text('Consumidor final', MARGIN + 30, 52)
  doc.text(sale.paymentMethod, MARGIN + 30, 59)

  let lastCursorY = 68
  autoTable(doc, {
    startY: 68,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Producto', 'Cantidad', 'Precio unitario', 'Subtotal']],
    body: sale.items.map((it) => [
      it.productName,
      String(it.quantity),
      formatARS(it.unitPrice),
      formatARS(it.subtotal),
    ]),
    foot: [
      [
        { content: 'TOTAL', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatARS(sale.total), styles: { halign: 'right', fontStyle: 'bold' } },
      ],
    ],
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      textColor: [...INK],
      lineColor: [...HAIRLINE],
      lineWidth: 0.2,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    headStyles: {
      fillColor: [...RED],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: [...ZEBRA] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    footStyles: {
      fillColor: [254, 242, 242],
      textColor: [...RED],
      fontStyle: 'bold',
      fontSize: 12,
      lineColor: [...RED],
      lineWidth: 0.5,
    },
    didDrawPage: (data) => {
      if (data.cursor) lastCursorY = data.cursor.y
    },
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...NOTE)
  doc.text(
    'Los precios corresponden al momento de la venta. Documento generado por Golosinas del Remate.',
    MARGIN,
    lastCursorY + 8,
  )

  doc.save(`Venta-${sale.number}.pdf`)
}
