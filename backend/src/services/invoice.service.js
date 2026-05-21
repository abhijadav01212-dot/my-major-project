import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { all, get, run } from '../database/sqlite.js';

const publicUrl = process.env.PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
const supportPhone = process.env.GARAGE_PHONE || '+919999999999';

export function buildInvoiceNumber() {
  return `GST-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function platformQrPayload() {
  return publicUrl;
}

export async function qrDataUrl(payload) {
  return QRCode.toDataURL(payload, { margin: 1, width: 180, color: { dark: '#0f766e', light: '#ffffff' } });
}

export function getInvoice(id) {
  return get(
    `SELECT i.*, p.method, p.transaction_id, p.utr_number, p.screenshot_url, p.created_at AS payment_date,
            u.name AS customer_name, u.email AS customer_email, u.mobile AS customer_mobile
     FROM invoices i
     JOIN payments p ON i.payment_id = p.id
     JOIN users u ON i.customer_id = u.id
     WHERE i.id = ?`,
    [id]
  );
}

export function getInvoiceByPayment(paymentId) {
  return get('SELECT * FROM invoices WHERE payment_id = ?', [paymentId]);
}

export function getInvoiceByNumber(invoiceNumber) {
  return get(
    `SELECT i.*, p.method, p.transaction_id, p.utr_number, u.name AS customer_name, u.customer_id AS customer_code
     FROM invoices i
     JOIN payments p ON i.payment_id = p.id
     JOIN users u ON i.customer_id = u.id
     WHERE i.invoice_number = ?`,
    [invoiceNumber]
  );
}

export function listInvoicesForCustomer(customerId) {
  return all(
    `SELECT i.*, p.method, p.transaction_id, p.utr_number
     FROM invoices i JOIN payments p ON i.payment_id = p.id
     WHERE i.customer_id = ?
     ORDER BY i.created_at DESC`,
    [customerId]
  );
}

export function searchInvoices({ customerCode, invoiceNumber }) {
  if (invoiceNumber) {
    return all(
      `SELECT i.*, u.name AS customer_name, u.customer_id AS customer_code, p.method, p.transaction_id
       FROM invoices i
       JOIN users u ON i.customer_id = u.id
       JOIN payments p ON i.payment_id = p.id
       WHERE i.invoice_number = ?
       ORDER BY i.created_at DESC`,
      [invoiceNumber]
    );
  }
  if (customerCode) {
    return all(
      `SELECT i.*, u.name AS customer_name, u.customer_id AS customer_code, p.method, p.transaction_id
       FROM invoices i
       JOIN users u ON i.customer_id = u.id
       JOIN payments p ON i.payment_id = p.id
       WHERE u.customer_id = ?
       ORDER BY i.created_at DESC`,
      [customerCode]
    );
  }
  return [];
}

export async function createInvoiceForPayment(paymentId) {
  const existing = getInvoiceByPayment(paymentId);
  if (existing) return existing;

  const payment = get(
    `SELECT p.*, u.name AS customer_name, u.customer_id AS customer_code, u.mobile AS customer_mobile,
            pr.name AS product_name, v.registration_number, v.make, v.model
     FROM payments p
     JOIN users u ON p.customer_id = u.id
     LEFT JOIN products pr ON p.product_id = pr.id
     LEFT JOIN repairs r ON p.repair_id = r.id
     LEFT JOIN vehicles v ON r.vehicle_id = v.id
     WHERE p.id = ?`,
    [paymentId]
  );
  if (!payment) throw new Error('Payment not found for invoice generation');

  const invoiceNumber = payment.invoice_number || buildInvoiceNumber();
  if (payment.invoice_number !== invoiceNumber) {
    run('UPDATE payments SET invoice_number = ? WHERE id = ?', [invoiceNumber, paymentId]);
  }
  const vehicleDetails = [payment.registration_number, payment.make, payment.model].filter(Boolean).join(' ');
  const lineItems = JSON.stringify([
    payment.product_name ? { label: payment.product_name, amount: payment.product_cost || payment.amount } : null,
    payment.repair_charges ? { label: 'Repair charges', amount: payment.repair_charges } : null,
    payment.service_tax ? { label: 'Service tax', amount: payment.service_tax } : null,
    payment.gst_amount ? { label: `GST ${payment.gst_rate || 18}%`, amount: payment.gst_amount } : null
  ].filter(Boolean));
  const invoiceUrl = `${publicUrl}/invoice/${encodeURIComponent(invoiceNumber)}`;
  const whatsappText = encodeURIComponent(`TorqueIQ Nexus invoice ${invoiceNumber} for Customer ID ${payment.customer_code}. Amount Rs. ${payment.amount}. ${invoiceUrl}`);
  const supportText = encodeURIComponent(`Hello TorqueIQ support, I need help with invoice ${invoiceNumber}.`);
  const whatsappInvoiceLink = `https://wa.me/?text=${whatsappText}`;
  const whatsappSupportLink = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${supportText}`;
  const qrPayload = invoiceUrl;

  const result = run(
    `INSERT INTO invoices (payment_id, customer_id, invoice_number, customer_code, vehicle_details, line_items,
      subtotal, repair_charges, product_cost, gst_rate, gst_amount, service_tax, final_amount, payment_status,
      qr_data, whatsapp_invoice_link, whatsapp_support_link)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payment.id,
      payment.customer_id,
      invoiceNumber,
      payment.customer_code,
      vehicleDetails,
      lineItems,
      payment.subtotal || payment.amount,
      payment.repair_charges || 0,
      payment.product_cost || 0,
      payment.gst_rate || 18,
      payment.gst_amount || 0,
      payment.service_tax || 0,
      payment.amount,
      payment.status,
      qrPayload,
      whatsappInvoiceLink,
      whatsappSupportLink
    ]
  );
  return getInvoice(Number(result.lastInsertRowid));
}

export async function invoicePdfBuffer(invoice) {
  const qrBuffer = await QRCode.toBuffer(invoice.qr_data || publicUrl, { margin: 1, width: 140 });
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fillColor('#0f766e').fontSize(22).text('TorqueIQ Nexus', { continued: true });
    doc.fillColor('#475569').fontSize(10).text('  Provided by Abhishek Jatav');
    doc.moveDown();
    doc.fillColor('#0f172a').fontSize(18).text('GST Invoice / Smart Bill');
    doc.fontSize(10).fillColor('#475569').text(`Invoice: ${invoice.invoice_number}`);
    doc.text(`Customer ID: ${invoice.customer_code || 'N/A'}`);
    doc.text(`Payment Status: ${invoice.payment_status}`);
    doc.text(`Payment Date: ${invoice.payment_date || invoice.created_at}`);
    doc.image(qrBuffer, 410, 70, { width: 110 });
    doc.moveDown();
    doc.fillColor('#0f172a').fontSize(12).text(`Customer: ${invoice.customer_name || ''}`);
    doc.text(`Mobile: ${invoice.customer_mobile || ''}`);
    if (invoice.customer_email) doc.text(`Email: ${invoice.customer_email}`);
    if (invoice.vehicle_details) doc.text(`Vehicle: ${invoice.vehicle_details}`);
    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: Rs. ${invoice.subtotal}`);
    doc.text(`Repair Charges: Rs. ${invoice.repair_charges}`);
    doc.text(`Product Cost: Rs. ${invoice.product_cost}`);
    doc.text(`GST (${invoice.gst_rate}%): Rs. ${invoice.gst_amount}`);
    doc.text(`Service Tax: Rs. ${invoice.service_tax}`);
    doc.moveDown();
    doc.fillColor('#0f766e').fontSize(16).text(`Final Amount: Rs. ${invoice.final_amount}`);
    doc.moveDown();
    doc.fillColor('#475569').fontSize(10).text(`Transaction ID: ${invoice.transaction_id || 'N/A'}`);
    doc.text(`UTR Number: ${invoice.utr_number || 'N/A'}`);
    doc.text('Scan the QR code to open the invoice/platform link.');
    doc.end();
  });
}

export function mapInvoice(row) {
  return {
    _id: row.id,
    id: row.id,
    paymentId: row.payment_id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_code,
    customerName: row.customer_name,
    vehicleDetails: row.vehicle_details,
    subtotal: row.subtotal,
    repairCharges: row.repair_charges,
    productCost: row.product_cost,
    gstRate: row.gst_rate,
    gstAmount: row.gst_amount,
    serviceTax: row.service_tax,
    finalAmount: row.final_amount,
    paymentStatus: row.payment_status,
    qrData: row.qr_data,
    whatsappInvoiceLink: row.whatsapp_invoice_link,
    whatsappSupportLink: row.whatsapp_support_link,
    createdAt: row.created_at,
    pdfUrl: `/api/invoices/${row.id}/pdf`
  };
}
