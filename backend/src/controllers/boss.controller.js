import bcrypt from 'bcryptjs';
import { all, apiUser, findUserById, get, run } from '../database/sqlite.js';

function paymentRow(row) {
  return {
    _id: row.id,
    id: row.id,
    amount: row.amount,
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

export async function overview(_req, res) {
  const customers = get("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'").total;
  const staff = get("SELECT COUNT(*) AS total FROM users WHERE role = 'staff'").total;
  const pendingRepairs = get("SELECT COUNT(*) AS total FROM repairs WHERE status NOT IN ('completed', 'cancelled')").total;
  const completedRepairs = get("SELECT COUNT(*) AS total FROM repairs WHERE status = 'completed'").total;
  const revenue = get("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success'").total;
  const complaints = get("SELECT COUNT(*) AS total FROM complaints WHERE status != 'resolved'").total;
  const productSales = get("SELECT COUNT(*) AS total FROM payments WHERE product_id IS NOT NULL AND status = 'success'").total;
  res.json({ customers, staff, pendingRepairs, completedRepairs, revenue, complaints, productSales });
}

export async function allComplaints(_req, res) {
  const rows = all(
    `SELECT c.*, u.name AS customer_name, u.mobile AS customer_mobile
     FROM complaints c JOIN users u ON c.customer_id = u.id
     ORDER BY c.created_at DESC`
  );
  res.json(rows.map((row) => ({
    _id: row.id,
    title: row.title,
    type: row.type,
    description: row.description,
    status: row.status,
    adminReply: row.admin_reply,
    customer: { name: row.customer_name, mobile: row.customer_mobile },
    createdAt: row.created_at
  })));
}

export async function updateComplaint(req, res) {
  const complaint = get('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  run(
    'UPDATE complaints SET status = ?, admin_reply = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.body.status || complaint.status, req.body.adminReply || complaint.admin_reply || '', req.params.id]
  );
  res.json({ message: 'Complaint solved' });
}

export async function manageStaff(_req, res) {
  res.json(all("SELECT id, name, email, mobile, username AS loginId, customer_id AS customerId, role, status, last_activity AS lastActivity, created_at AS createdAt FROM users WHERE role = 'staff' ORDER BY created_at DESC"));
}

export async function allCustomers(_req, res) {
  res.json(all("SELECT id, name, email, mobile, username AS loginId, customer_id AS customerId, role, status, last_activity AS lastActivity, created_at AS createdAt FROM users WHERE role = 'customer' ORDER BY created_at DESC"));
}

export async function allUsers(_req, res) {
  res.json(all("SELECT id, name, email, mobile, username AS loginId, customer_id AS customerId, role, status, last_activity AS lastActivity, created_at AS createdAt FROM users ORDER BY created_at DESC"));
}

export async function loginHistory(_req, res) {
  res.json(all('SELECT * FROM login_history ORDER BY login_at DESC LIMIT 200'));
}

export async function paymentHistory(_req, res) {
  const rows = all(
    `SELECT p.*, u.name AS customer_name, u.customer_id AS customer_code, i.id AS invoice_id
     FROM payments p JOIN users u ON p.customer_id = u.id
     LEFT JOIN invoices i ON i.payment_id = p.id
     ORDER BY p.created_at DESC`
  );
  res.json(rows.map(paymentRow));
}

export async function analyticsReports(_req, res) {
  const topServices = all('SELECT issue_type AS name, COUNT(*) AS total FROM repairs GROUP BY issue_type ORDER BY total DESC LIMIT 5');
  const staffPerformance = all(
    `SELECT u.name, COUNT(r.id) AS jobs
     FROM users u LEFT JOIN repairs r ON r.mechanic_id = u.id
     WHERE u.role = 'staff'
     GROUP BY u.id ORDER BY jobs DESC`
  );
  const customerGrowth = all("SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS total FROM users WHERE role = 'customer' GROUP BY substr(created_at, 1, 10) ORDER BY date");
  const paymentReports = all("SELECT method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM payments GROUP BY method");
  res.json({ topServices, staffPerformance, customerGrowth, paymentReports });
}

export async function setStaffStatus(req, res) {
  const staff = findUserById(req.params.id);
  if (!staff || staff.role !== 'staff') return res.status(404).json({ message: 'Staff record not found' });
  run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.body.status || 'active', req.params.id]);
  res.json(apiUser(findUserById(req.params.id)));
}

export async function changeBossPassword(req, res) {
  if (String(req.body.secretCode) !== String(process.env.SECRET_CODE || '8813')) return res.status(403).json({ message: 'Secret code required' });
  if (!req.body.newPassword || req.body.newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
  const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  run("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE role = 'boss'", [passwordHash]);
  res.json({ message: 'Boss password changed' });
}

export async function systemReset(req, res) {
  if (String(req.body.secretCode) !== String(process.env.SECRET_CODE || '8813')) return res.status(403).json({ message: 'Secret code required' });
  for (const table of ['vehicles', 'repairs', 'complaints', 'products', 'product_photos', 'payments', 'messages', 'analytics_reports', 'login_history']) {
    run(`DELETE FROM ${table}`);
  }
  run("DELETE FROM users WHERE role != 'boss'");
  res.json({ message: 'System operational data reset completed' });
}
