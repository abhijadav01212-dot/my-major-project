import { all, get, run } from '../database/sqlite.js';

export async function inbox(req, res) {
  const rows = req.user.role === 'boss'
    ? all(
      `SELECT m.*, s.name AS sender_name, s.role AS sender_role, r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       LEFT JOIN users r ON m.receiver_id = r.id
       ORDER BY m.created_at DESC`
    )
    : all(
      `SELECT m.*, s.name AS sender_name, s.role AS sender_role, r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       LEFT JOIN users r ON m.receiver_id = r.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.id]
    );
  res.json(rows.map((row) => ({
    _id: row.id,
    body: row.body,
    channel: row.channel,
    sender: { id: row.sender_id, name: row.sender_name, role: row.sender_role },
    receiver: row.receiver_id ? { id: row.receiver_id, name: row.receiver_name } : null,
    createdAt: row.created_at
  })));
}

export async function sendMessage(req, res) {
  if (!req.body.body) return res.status(400).json({ message: 'Message cannot be empty' });
  let receiver = Number(req.body.receiver || 0) || null;
  if (!receiver && req.user.role === 'customer') {
    receiver = get("SELECT id FROM users WHERE role = 'boss' ORDER BY id LIMIT 1")?.id || null;
  }
  if (req.user.role === 'staff') {
    if (!receiver) return res.status(400).json({ message: 'Select a customer before sending a repair update' });
    const assigned = get('SELECT id FROM repairs WHERE mechanic_id = ? AND customer_id = ? LIMIT 1', [req.user.id, receiver]);
    if (!assigned) return res.status(403).json({ message: 'You can message only customers assigned to your repair work' });
  }
  if (receiver) {
    const target = get('SELECT id FROM users WHERE id = ?', [receiver]);
    if (!target) return res.status(404).json({ message: 'Message receiver not found' });
  }
  const result = run(
    'INSERT INTO messages (sender_id, receiver_id, body, channel) VALUES (?, ?, ?, ?)',
    [req.user.id, receiver, req.body.body, req.body.channel || 'support']
  );
  res.status(201).json({ _id: Number(result.lastInsertRowid), body: req.body.body });
}
