import jwt from 'jsonwebtoken';
import { apiUser, findUserById, touchUser } from '../database/sqlite.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id || user._id, role: user.role },
    process.env.JWT_SECRET || 'dev_secret_replace_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_replace_me');
    const user = findUserById(payload.id);
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'Session is no longer valid' });
    touchUser(user.id);
    req.user = apiUser(user);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Access denied for this role' });
    next();
  };
}

export function requireSecretCode(req, res, next) {
  if (String(req.body.secretCode || req.headers['x-secret-code']) !== String(process.env.SECRET_CODE || '8813')) {
    return res.status(403).json({ message: 'Secret code required for this sensitive action' });
  }
  next();
}
