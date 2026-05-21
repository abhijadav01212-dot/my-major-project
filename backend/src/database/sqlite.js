import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.resolve(__dirname, '../../../database/torqueiq.sqlite');
const dbPath = process.env.SQLITE_PATH ? path.resolve(process.env.SQLITE_PATH) : defaultPath;

let db;

export function getDb() {
  if (!db) initDatabase();
  return db;
}

export function initDatabase() {
  if (db) return db;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(schema);
  migrateDatabase();
  seedBossAccount();
  seedAccountsAccount();
  ensureExistingCustomerIds();
  return db;
}

export function databaseStatus() {
  return { connected: Boolean(db), path: dbPath, message: 'Database Connected Successfully' };
}

export function run(sql, params = []) {
  return getDb().prepare(sql).run(...params);
}

export function get(sql, params = []) {
  return getDb().prepare(sql).get(...params);
}

export function all(sql, params = []) {
  return getDb().prepare(sql).all(...params);
}

export function apiUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    loginId: row.username,
    role: row.role,
    customerId: row.customer_id,
    status: row.status,
    lastActivity: row.last_activity,
    createdAt: row.created_at
  };
}

export function findUserById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}

export function findUserByIdentifier(identifier) {
  const lookup = String(identifier || '').trim().toLowerCase();
  return get('SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ? OR mobile = ?', [lookup, lookup, String(identifier || '').trim()]);
}

export function touchUser(userId) {
  run('UPDATE users SET last_activity = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
}

export function recordLogin(user, req) {
  run(
    `INSERT INTO login_history (user_id, name, email, mobile, username, role, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.id, user.name, user.email, user.mobile, user.username, user.role, req.ip || '', req.headers['user-agent'] || '']
  );
  touchUser(user.id);
}

export function seedBossAccount() {
  const username = process.env.BOSS_ID || 'boss2026';
  const password = process.env.BOSS_PASSWORD || 'boss@2026';
  const passwordHash = bcrypt.hashSync(password, 12);
  run("DELETE FROM users WHERE role = 'boss' AND username != ?", [username]);
  const existing = get('SELECT id FROM users WHERE username = ? AND role = ?', [username, 'boss']);
  if (existing) {
    run('UPDATE users SET password_hash = ?, name = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, 'Boss Admin', 'active', existing.id]);
    return;
  }
  run(
    `INSERT INTO users (name, email, mobile, username, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Boss Admin', null, '0000000000', username, passwordHash, 'boss', 'active']
  );
}

export function seedAccountsAccount() {
  const username = process.env.ACCOUNTS_ID || 'account2026';
  const password = process.env.ACCOUNTS_PASSWORD || 'account@2026';
  const passwordHash = bcrypt.hashSync(password, 12);
  run("DELETE FROM users WHERE role = 'accounts' AND username != ?", [username]);
  const existing = get('SELECT id FROM users WHERE username = ? AND role = ?', [username, 'accounts']);
  if (existing) {
    run('UPDATE users SET password_hash = ?, name = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, 'Accounts Department', 'active', existing.id]);
    return;
  }
  run(
    `INSERT INTO users (name, email, mobile, username, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Accounts Department', null, '0000000001', username, passwordHash, 'accounts', 'active']
  );
}

export function generateCustomerId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  do {
    id = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (get('SELECT id FROM users WHERE customer_id = ?', [id]));
  return id;
}

function ensureExistingCustomerIds() {
  const customers = all("SELECT id FROM users WHERE role = 'customer' AND (customer_id IS NULL OR customer_id = '')");
  for (const customer of customers) {
    run('UPDATE users SET customer_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [generateCustomerId(), customer.id]);
  }
}

function migrateDatabase() {
  const userColumns = all('PRAGMA table_info(users)').map((column) => column.name);
  const userSql = get("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'")?.sql || '';
  if (!userColumns.includes('customer_id') || !userSql.includes("'accounts'")) {
    const customerIdSelect = userColumns.includes('customer_id') ? 'customer_id' : 'NULL';
    db.exec(`
      PRAGMA foreign_keys = OFF;
      CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        mobile TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        customer_id TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'boss', 'accounts')),
        status TEXT NOT NULL DEFAULT 'active',
        last_activity TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT OR IGNORE INTO users_new (id, name, email, mobile, username, password_hash, role, status, last_activity, created_at, updated_at)
        SELECT id, name, email, mobile, username, password_hash, role, status, last_activity, created_at, updated_at FROM users;
      UPDATE users_new
        SET customer_id = (
          SELECT ${customerIdSelect} FROM users WHERE users.id = users_new.id
        );
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      PRAGMA foreign_keys = ON;
    `);
  }

  addColumnIfMissing('payments', 'subtotal', 'REAL DEFAULT 0');
  addColumnIfMissing('payments', 'repair_charges', 'REAL DEFAULT 0');
  addColumnIfMissing('payments', 'product_cost', 'REAL DEFAULT 0');
  addColumnIfMissing('payments', 'gst_rate', 'REAL DEFAULT 18');
  addColumnIfMissing('payments', 'gst_amount', 'REAL DEFAULT 0');
  addColumnIfMissing('payments', 'service_tax', 'REAL DEFAULT 0');
  addColumnIfMissing('payments', 'approved_by', 'INTEGER');
  addColumnIfMissing('payments', 'approved_at', 'TEXT');
  addColumnIfMissing('payments', 'notes', 'TEXT');
  db.exec(schema);
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);');
}

function addColumnIfMissing(table, column, definition) {
  const columns = all(`PRAGMA table_info(${table})`).map((entry) => entry.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  mobile TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  customer_id TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'boss', 'accounts')),
  status TEXT NOT NULL DEFAULT 'active',
  last_activity TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT,
  email TEXT,
  mobile TEXT,
  username TEXT,
  role TEXT,
  ip TEXT,
  user_agent TEXT,
  login_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  registration_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  fuel_type TEXT DEFAULT 'petrol',
  odometer_km INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  vehicle_id INTEGER,
  mechanic_id INTEGER,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'submitted',
  bill_amount REAL DEFAULT 0,
  paid INTEGER DEFAULT 0,
  completed_by_customer INTEGER DEFAULT 0,
  ai_estimate TEXT,
  issue_photos TEXT,
  proof_photos TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  vehicle_id INTEGER,
  type TEXT DEFAULT 'service_request',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  admin_reply TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  product_id INTEGER,
  repair_id INTEGER,
  amount REAL NOT NULL,
  subtotal REAL DEFAULT 0,
  repair_charges REAL DEFAULT 0,
  product_cost REAL DEFAULT 0,
  gst_rate REAL DEFAULT 18,
  gst_amount REAL DEFAULT 0,
  service_tax REAL DEFAULT 0,
  method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  utr_number TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  invoice_number TEXT NOT NULL,
  approved_by INTEGER,
  approved_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_code TEXT,
  vehicle_details TEXT,
  line_items TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  repair_charges REAL NOT NULL DEFAULT 0,
  product_cost REAL NOT NULL DEFAULT 0,
  gst_rate REAL NOT NULL DEFAULT 18,
  gst_amount REAL NOT NULL DEFAULT 0,
  service_tax REAL NOT NULL DEFAULT 0,
  final_amount REAL NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'success',
  qr_data TEXT,
  whatsapp_invoice_link TEXT,
  whatsapp_support_link TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS qr_references (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  reference_id TEXT,
  qr_data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER,
  body TEXT NOT NULL,
  channel TEXT DEFAULT 'support',
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  metrics TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
`;
