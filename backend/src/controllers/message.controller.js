import { all, run } from '../database/sqlite.js';

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
       WHERE m.sender_id = ? OR m.receiver_id = ? OR m.receiver_id IS NULL
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.id]
    );
  res.json(rows.map((row) => ({
    _id: row.id,
    body: row.body,
    channel: row.channel,
    sender: { name: row.sender_name, role: row.sender_role },
    receiver: row.receiver_name ? { name: row.receiver_name } : null,
    createdAt: row.created_at
  })));
}

export async function sendMessage(req, res) {
  if (!req.body.body) return res.status(400).json({ message: 'Message cannot be empty' });
  const result = run(
    'INSERT INTO messages (sender_id, receiver_id, body, channel) VALUES (?, ?, ?, ?)',
    [req.user.id, req.body.receiver || null, req.body.body, req.body.channel || 'support']
  );
  res.status(201).json({ _id: Number(result.lastInsertRowid), body: req.body.body });
}
