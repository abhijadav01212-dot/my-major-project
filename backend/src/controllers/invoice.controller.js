import { getInvoice, invoicePdfBuffer, listInvoicesForCustomer, mapInvoice, platformQrPayload, qrDataUrl, searchInvoices } from '../services/invoice.service.js';

export async function myInvoices(req, res) {
  res.json(listInvoicesForCustomer(req.user.id).map(mapInvoice));
}

export async function searchInvoice(req, res) {
  const rows = searchInvoices({ customerCode: req.query.customerId, invoiceNumber: req.query.invoiceNumber });
  if (req.user.role === 'customer') {
    return res.json(rows.filter((row) => row.customer_id === req.user.id || row.customer_code === req.user.customerId).map(mapInvoice));
  }
  res.json(rows.map(mapInvoice));
}

export async function invoiceQr(req, res) {
  const invoice = getInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json({ qrDataUrl: await qrDataUrl(invoice.qr_data), qrData: invoice.qr_data });
}

export async function platformQr(_req, res) {
  res.json({ qrDataUrl: await qrDataUrl(platformQrPayload()), qrData: platformQrPayload() });
}

export async function invoicePdf(req, res) {
  const invoice = getInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  if (req.user.role === 'customer' && invoice.customer_id !== req.user.id) return res.status(403).json({ message: 'Invoice access denied' });
  const buffer = await invoicePdfBuffer(invoice);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
  res.send(buffer);
}
