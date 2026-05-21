import { all, get, run } from '../database/sqlite.js';
import { buildInvoiceNumber, createInvoiceForPayment, mapInvoice } from '../services/invoice.service.js';

function mapPayment(row) {
  return {
    _id: row.id,
    id: row.id,
    amount: row.amount,
    subtotal: row.subtotal,
    repairCharges: row.repair_charges,
    productCost: row.product_cost,
    gstRate: row.gst_rate,
    gstAmount: row.gst_amount,
    serviceTax: row.service_tax,
    method: row.method,
    status: row.status,
    transactionId: row.transaction_id,
    utrNumber: row.utr_number,
    invoiceNumber: row.invoice_number,
    invoiceId: row.invoice_id,
    screenshotUrl: row.screenshot_url,
    customerName: row.customer_name,
    customerId: row.customer_code,
    createdAt: row.created_at
  };
}

export async function accountsSummary(_req, res) {
  const totalRevenue = get("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success'").total;
  const dailyIncome = get("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success' AND date(created_at) = date('now')").total;
  const monthlyIncome = get("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").total;
  const gstCollected = get("SELECT COALESCE(SUM(gst_amount), 0) AS total FROM payments WHERE status = 'success'").total;
  const pendingPayments = get("SELECT COUNT(*) AS total FROM payments WHERE status = 'pending'").total;
  const successfulTransactions = get("SELECT COUNT(*) AS total FROM payments WHERE status = 'success'").total;
  res.json({ totalRevenue, dailyIncome, monthlyIncome, gstCollected, pendingPayments, successfulTransactions });
}

export async function accountPayments(_req, res) {
  const rows = all(
    `SELECT p.*, u.name AS customer_name, u.customer_id AS customer_code, i.id AS invoice_id
     FROM payments p JOIN users u ON p.customer_id = u.id
     LEFT JOIN invoices i ON i.payment_id = p.id
     ORDER BY p.created_at DESC`
  );
  res.json(rows.map(mapPayment));
}

export async function createSmartBill(req, res) {
  const customer = get('SELECT * FROM users WHERE customer_id = ? OR id = ?', [req.body.customerId, req.body.customerUserId || 0]);
  if (!customer || customer.role !== 'customer') return res.status(404).json({ message: 'Customer not found for billing' });
  const repairCharges = Number(req.body.repairCharges || 0);
  const productCost = Number(req.body.productCost || 0);
  const gstRate = Number(req.body.gstRate ?? 18);
  const subtotal = repairCharges + productCost;
  const gstAmount = Number(req.body.gstAmount || Math.round((subtotal * gstRate) / 100));
  const serviceTax = Number(req.body.serviceTax || 0);
  const finalAmount = Number(req.body.amount || subtotal + gstAmount + serviceTax);
  const invoiceNumber = buildInvoiceNumber();
  const result = run(
    `INSERT INTO payments (customer_id, amount, subtotal, repair_charges, product_cost, gst_rate, gst_amount,
      service_tax, method, transaction_id, utr_number, screenshot_url, status, invoice_number, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      customer.id,
      finalAmount,
      subtotal,
      repairCharges,
      productCost,
      gstRate,
      gstAmount,
      serviceTax,
      req.body.method || 'UPI',
      req.body.transactionId || `BILL-${Date.now()}`,
      req.body.utrNumber || '',
      req.file ? `/uploads/${req.file.filename}` : '',
      invoiceNumber,
      req.body.notes || ''
    ]
  );
  res.status(201).json({ message: 'Smart bill created for approval', paymentId: Number(result.lastInsertRowid), invoiceNumber });
}

export async function approvePayment(req, res) {
  const payment = get('SELECT * FROM payments WHERE id = ?', [req.params.id]);
  if (!payment) return res.status(404).json({ message: 'Payment record not found' });
  run('UPDATE payments SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?', ['success', req.user.id, req.params.id]);
  const invoice = await createInvoiceForPayment(req.params.id);
  res.json({ message: 'Payment Successful', invoice: mapInvoice(invoice) });
}
