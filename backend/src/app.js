import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { databaseStatus, initDatabase } from './database/sqlite.js';
import authRoutes from './routes/auth.routes.js';
import bossRoutes from './routes/boss.routes.js';
import customerRoutes from './routes/customer.routes.js';
import staffRoutes from './routes/staff.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import messageRoutes from './routes/message.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
initDatabase();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 400 }));
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

app.get('/api/health', (_req, res) => {
  const status = databaseStatus();
  res.json({
    ok: true,
    database: 'connected',
    databasePath: status.path,
    message: status.message,
    brand: 'Provided by Abhishek Jatav',
    project: 'TorqueIQ Nexus'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/boss', bossRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ai', aiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
