import { all, get, run } from '../database/sqlite.js';
import { predictRepair } from '../services/ai.service.js';

function vehicleRow(row) {
  return {
    _id: row.id,
    id: row.id,
    registrationNumber: row.registration_number,
    make: row.make,
    model: row.model,
    year: row.year,
    fuelType: row.fuel_type,
    odometerKm: row.odometer_km,
    createdAt: row.created_at
  };
}

function repairRow(row) {
  const estimate = row.ai_estimate ? JSON.parse(row.ai_estimate) : {};
  return {
    _id: row.id,
    id: row.id,
    issueType: row.issue_type,
    description: row.description,
    priority: row.priority,
    vehicleType: row.vehicle_type,
    bookingBrand: row.booking_brand,
    bookingModel: row.booking_model,
    serviceType: row.service_type,
    scheduledAt: row.scheduled_at,
    estimatedCost: row.estimated_cost,
    status: row.status,
    billAmount: row.bill_amount,
    paid: Boolean(row.paid),
    completedByCustomer: Boolean(row.completed_by_customer),
    aiEstimate: estimate,
    vehicle: row.registration_number ? {
      registrationNumber: row.registration_number,
      make: row.make,
      model: row.model
    } : null,
    createdAt: row.created_at
  };
}

export async function addVehicle(req, res) {
  const { registrationNumber, make, model, year, fuelType = 'petrol', odometerKm = 0 } = req.body;
  if (!registrationNumber || !make || !model) return res.status(400).json({ message: 'Registration number, make, and model are required' });
  const result = run(
    `INSERT INTO vehicles (owner_id, registration_number, make, model, year, fuel_type, odometer_km)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, String(registrationNumber).toUpperCase(), make, model, Number(year || 0), fuelType, Number(odometerKm || 0)]
  );
  res.status(201).json(vehicleRow(get('SELECT * FROM vehicles WHERE id = ?', [Number(result.lastInsertRowid)])));
}

export async function myVehicles(req, res) {
  res.json(all('SELECT * FROM vehicles WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id]).map(vehicleRow));
}

export async function createRepairJob(req, res) {
  const vehicle = req.body.vehicle ? get('SELECT * FROM vehicles WHERE id = ? AND owner_id = ?', [req.body.vehicle, req.user.id]) : null;
  if (req.body.vehicle && !vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  if (!req.body.issueType || !req.body.description) return res.status(400).json({ message: 'Issue/problem and description are required' });
  const issuePhotos = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const aiEstimate = predictRepair({
    issueType: req.body.issueType,
    odometerKm: vehicle?.odometer_km || req.body.odometerKm || 0,
    year: vehicle?.year || req.body.year || new Date().getFullYear(),
    priority: req.body.priority
  });
  const estimatedCost = Number(req.body.estimatedCost || Math.round(((aiEstimate.costMin || 0) + (aiEstimate.costMax || 0)) / 2));
  const result = run(
    `INSERT INTO repairs (customer_id, vehicle_id, vehicle_type, booking_brand, booking_model, service_type, scheduled_at,
      issue_type, description, priority, estimated_cost, status, ai_estimate, issue_photos)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
    [
      req.user.id,
      vehicle?.id || null,
      req.body.vehicleType || '',
      req.body.brand || vehicle?.make || '',
      req.body.model || vehicle?.model || '',
      req.body.serviceType || 'General inspection',
      req.body.scheduledAt || '',
      req.body.issueType,
      req.body.description,
      req.body.priority || 'normal',
      estimatedCost,
      JSON.stringify(aiEstimate),
      JSON.stringify(issuePhotos)
    ]
  );
  res.status(201).json(repairRow(getRepairById(Number(result.lastInsertRowid))));
}

export async function myJobs(req, res) {
  res.json(allRepairsForCustomer(req.user.id).map(repairRow));
}

export async function markComplete(req, res) {
  run("UPDATE repairs SET completed_by_customer = 1, status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
  res.json(repairRow(getRepairById(req.params.id)));
}

export async function createComplaint(req, res) {
  const { type = 'service_request', title, description, vehicle } = req.body;
  if (!title || !description) return res.status(400).json({ message: 'Complaint title and description are required' });
  const result = run(
    `INSERT INTO complaints (customer_id, vehicle_id, type, title, description)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, vehicle || null, type, title, description]
  );
  res.status(201).json({ _id: Number(result.lastInsertRowid), type, title, description, status: 'open' });
}

export async function myComplaints(req, res) {
  const rows = all('SELECT * FROM complaints WHERE customer_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(rows.map((row) => ({ _id: row.id, title: row.title, type: row.type, description: row.description, status: row.status, adminReply: row.admin_reply, createdAt: row.created_at })));
}

export async function sendFeedback(req, res) {
  res.status(201).json({ message: 'Feedback saved' });
}

export async function messageSupport(req, res) {
  const boss = get("SELECT id FROM users WHERE role = 'boss' ORDER BY id LIMIT 1");
  const result = run('INSERT INTO messages (sender_id, receiver_id, body, channel) VALUES (?, ?, ?, ?)', [req.user.id, boss?.id || null, req.body.body, 'support']);
  res.status(201).json({ _id: Number(result.lastInsertRowid), body: req.body.body });
}

function getRepairById(id) {
  return get(
    `SELECT r.*, v.registration_number, v.make, v.model
     FROM repairs r LEFT JOIN vehicles v ON r.vehicle_id = v.id
     WHERE r.id = ?`,
    [id]
  );
}

function allRepairsForCustomer(customerId) {
  return all(
    `SELECT r.*, v.registration_number, v.make, v.model
     FROM repairs r LEFT JOIN vehicles v ON r.vehicle_id = v.id
     WHERE r.customer_id = ?
     ORDER BY r.created_at DESC`,
    [customerId]
  );
}
