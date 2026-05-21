import { all, get } from '../database/sqlite.js';

export async function dashboardAnalytics(req, res) {
  const scope = req.user.role === 'customer'
    ? 'WHERE customer_id = ?'
    : req.user.role === 'staff'
      ? 'WHERE mechanic_id = ?'
      : '';
  const params = req.user.role === 'boss' ? [] : [req.user.id];
  const totalCustomers = req.user.role === 'boss' ? get("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'").total : undefined;
  const pendingRepairs = get(`SELECT COUNT(*) AS total FROM repairs ${scope} ${scope ? "AND" : "WHERE"} status NOT IN ('completed', 'cancelled')`, params).total;
  const completedRepairs = get(`SELECT COUNT(*) AS total FROM repairs ${scope} ${scope ? "AND" : "WHERE"} status = 'completed'`, params).total;
  const revenue = req.user.role === 'boss'
    ? get("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success'").total
    : get("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE customer_id = ? AND status = 'success'", [req.user.id]).total;
  const statusRows = all(`SELECT status, COUNT(*) AS total FROM repairs ${scope} GROUP BY status`, params);
  const vehicleAnalytics = all('SELECT fuel_type AS _id, COUNT(*) AS count FROM vehicles GROUP BY fuel_type');
  const mechanicAnalytics = all("SELECT u.name, COUNT(r.id) AS jobs FROM users u LEFT JOIN repairs r ON r.mechanic_id = u.id WHERE u.role = 'staff' GROUP BY u.id");
  const productSales = get("SELECT COUNT(*) AS total FROM payments WHERE product_id IS NOT NULL AND status = 'success'").total;
  const paymentReports = all("SELECT method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM payments GROUP BY method");
  const statusCounts = Object.fromEntries(statusRows.map((row) => [row.status, row.total]));

  res.json({
    totalCustomers,
    pendingRepairs,
    completedRepairs,
    revenue,
    customerSatisfaction: 0,
    statusCounts,
    vehicleAnalytics,
    mechanicAnalytics,
    productSales,
    paymentReports,
    aiInsights: buildInsights({ pendingRepairs, completedRepairs, revenue, productSales })
  });
}

function buildInsights(metrics) {
  if (!metrics.pendingRepairs && !metrics.completedRepairs && !metrics.productSales) {
    return ['No operational data yet. Insights appear after real customer activity is created.'];
  }
  return [
    `${metrics.pendingRepairs} repairs are currently pending.`,
    `Confirmed revenue is Rs. ${metrics.revenue}.`,
    `${metrics.productSales} product purchases have been completed.`
  ];
}
