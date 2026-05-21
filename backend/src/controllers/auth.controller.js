import bcrypt from 'bcryptjs';
import { apiUser, findUserByIdentifier, findUserById, generateCustomerId, get, recordLogin, run } from '../database/sqlite.js';
import { signToken } from '../middleware/auth.middleware.js';

function publicUser(user) {
  return apiUser(user);
}

export async function register(req, res) {
  try {
    const { name, email, mobile, password, role = 'customer', staffSkill } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedMobile = String(mobile || '').trim();
    const normalizedEmail = email ? String(email).toLowerCase().trim() : null;
    const username = normalizedEmail || normalizedMobile;
    const customerId = role === 'customer' ? generateCustomerId() : null;

    if (!normalizedName || !normalizedMobile || !password) return res.status(400).json({ message: 'Name, mobile, and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    if (!['customer', 'staff'].includes(role)) return res.status(400).json({ message: 'Only customer or staff signup is allowed' });

    const existing = get(
      'SELECT id FROM users WHERE mobile = ? OR username = ? OR (? IS NOT NULL AND email = ?)',
      [normalizedMobile, username, normalizedEmail, normalizedEmail]
    );
    if (existing) return res.status(409).json({ message: 'An account already exists with this mobile or email' });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = run(
      `INSERT INTO users (name, email, mobile, username, customer_id, password_hash, role, status, last_activity)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
      [normalizedName, normalizedEmail, normalizedMobile, username, customerId, passwordHash, role]
    );
    const user = findUserById(Number(result.lastInsertRowid));
    recordLogin(user, req);
    res.status(201).json({ message: 'Account Created Successfully', token: signToken(user), user: publicUser(user) });
  } catch (error) {
    if (String(error.message || '').includes('UNIQUE')) return res.status(409).json({ message: 'An account already exists with this mobile or email' });
    throw error;
  }
}

export async function login(req, res) {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ message: 'Login ID and password are required' });
  const user = findUserByIdentifier(identifier);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.status !== 'active') return res.status(403).json({ message: 'This account is not active' });
  recordLogin(user, req);
  res.json({ message: 'Login Successful', token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
