import { all, get, run } from '../database/sqlite.js';

function jobRow(row) {
  return {
    _id: row.id,
    id: row.id,
    issueType: row.issue_type,
    priority: row.priority,
    status: row.status,
    billAmount: row.bill_amount,
    customer: { id: row.customer_id, name: row.customer_name, mobile: row.customer_mobile },
    vehicle: row.registration_number ? { registrationNumber: row.registration_number, make: row.make, model: row.model } : null
  };
}

export async function openJobs(_req, res) {
  const rows = all(
    `SELECT r.*, u.name AS customer_name, u.mobile AS customer_mobile, v.registration_number, v.make, v.model
     FROM repairs r
     JOIN users u ON r.customer_id = u.id
     LEFT JOIN vehicles v ON r.vehicle_id = v.id
     WHERE r.mechanic_id IS NULL AND r.status = 'submitted'
     ORDER BY r.created_at ASC`
  );
  res.json(rows.map(jobRow));
}

export async function acceptJob(req, res) {
  const job = get('SELECT * FROM repairs WHERE id = ? AND mechanic_id IS NULL', [req.params.id]);
  if (!job) return res.status(404).json({ message: 'Job is no longer available' });
  run("UPDATE repairs SET mechanic_id = ?, status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id, req.params.id]);
  res.json({ message: 'Job accepted' });
}

export async function myStaffJobs(req, res) {
  const rows = all(
    `SELECT r.*, u.name AS customer_name, u.mobile AS customer_mobile, v.registration_number, v.make, v.model
     FROM repairs r
     JOIN users u ON r.customer_id = u.id
     LEFT JOIN vehicles v ON r.vehicle_id = v.id
     WHERE r.mechanic_id = ?
     ORDER BY r.updated_at DESC`,
    [req.user.id]
  );
  res.json(rows.map(jobRow));
}

export async function updateJob(req, res) {
  const job = get('SELECT * FROM repairs WHERE id = ? AND mechanic_id = ?', [req.params.id, req.user.id]);
  if (!job) return res.status(404).json({ message: 'Assigned job not found' });
  const proofPhotos = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const existingProof = job.proof_photos ? JSON.parse(job.proof_photos) : [];
  const billAmount = Number(req.body.billAmount ?? job.bill_amount ?? 0);
  const nextStatus = req.body.status || job.status;
  run(
    `UPDATE repairs SET status = ?, bill_amount = ?, proof_photos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [nextStatus, billAmount, JSON.stringify([...existingProof, ...proofPhotos]), req.params.id]
  );
  if (req.body.note) {
    run(
      'INSERT INTO messages (sender_id, receiver_id, body, channel) VALUES (?, ?, ?, ?)',
      [req.user.id, job.customer_id, req.body.note, 'repair_update']
    );
  }
  if (nextStatus === 'completed' && job.status !== 'completed') {
    run(
      'INSERT INTO messages (sender_id, receiver_id, body, channel) VALUES (?, ?, ?, ?)',
      [req.user.id, job.customer_id, 'Your vehicle repair has been completed successfully.', 'repair_completed']
    );
  }
  res.json({ message: nextStatus === 'completed' ? 'Service completed' : 'Repair status updated' });
}
