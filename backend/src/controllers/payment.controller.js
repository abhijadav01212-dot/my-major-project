import { all, get, run } from '../database/sqlite.js';
import { createInvoiceForPayment, mapInvoice } from '../services/invoice.service.js';

function invoiceNumber() {
  return `TQ-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function mapPayment(row) {
  return {
    _id: row.id,
    id: row.id,
    amount: row.amount,
    method: row.method,
    transactionId: row.transaction_id,
    utrNumber: row.utr_number,
    screenshotUrl: row.screenshot_url,
    status: row.status,
    invoiceNumber: row.invoice_number,
    product: row.product_name ? { name: row.product_name } : null,
    createdAt: row.created_at
  };
}

export async function createPayment(req, res) {
  const repairCharges = Number(req.body.repairCharges || 0);
  const productCost = Number(req.body.productCost || req.body.amount || 0);
  const gstRate = Number(req.body.gstRate ?? 18);
  const subtotal = Number(req.body.subtotal || repairCharges + productCost || req.body.amount || 0);
  const gstAmount = Number(req.body.gstAmount || Math.round((subtotal * gstRate) / 100));
  const serviceTax = Number(req.body.serviceTax || 0);
  const amount = Number(req.body.amount || subtotal + gstAmount + serviceTax);
  const method = String(req.body.method || '').trim();
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid payment amount is required' });
  if (!['UPI', 'Card', 'Cash', 'Net Banking'].includes(method)) return res.status(400).json({ message: 'Valid payment method is required' });

  const productId = req.body.productId || null;
  if (productId) {
    const product = get('SELECT * FROM products WHERE id = ? AND status = ?', [productId, 'active']);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const quantity = Math.max(1, Number(req.body.quantity || 1));
    if (product.stock < quantity) return res.status(400).json({ message: 'Product stock is not available' });
    run('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [quantity, productId]);
  }

  const screenshot = req.file ? `/uploads/${req.file.filename}` : '';
  const transactionId = req.body.transactionId || `TXN-${Date.now()}`;
  const invoice = invoiceNumber();
  const result = run(
    `INSERT INTO payments (customer_id, product_id, repair_id, amount, subtotal, repair_charges, product_cost,
      gst_rate, gst_amount, service_tax, method, transaction_id, utr_number, screenshot_url, status, invoice_number, approved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'success', ?, CURRENT_TIMESTAMP)`,
    [req.user.id, productId, req.body.repairId || null, amount, subtotal, repairCharges, productCost, gstRate, gstAmount, serviceTax, method, transactionId, req.body.utrNumber || '', screenshot, invoice]
  );
  const payment = getPayment(Number(result.lastInsertRowid));
  const invoiceRow = await createInvoiceForPayment(payment.id);
  res.status(201).json({ message: 'Payment Successful', detail: `You paid Rs. ${amount} successfully`, payment: mapPayment(payment), invoice: mapInvoice(invoiceRow) });
}

export async function myPayments(req, res) {
  res.json(allPaymentsForCustomer(req.user.id).map(mapPayment));
}

function getPayment(id) {
  return get(
    `SELECT p.*, pr.name AS product_name
     FROM payments p LEFT JOIN products pr ON p.product_id = pr.id
     WHERE p.id = ?`,
    [id]
  );
}

function allPaymentsForCustomer(customerId) {
  return all(
    `SELECT p.*, pr.name AS product_name
     FROM payments p LEFT JOIN products pr ON p.product_id = pr.id
     WHERE p.customer_id = ?
     ORDER BY p.created_at DESC`,
    [customerId]
  );
}
