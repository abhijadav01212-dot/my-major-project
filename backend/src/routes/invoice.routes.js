import { Router } from 'express';
import { invoicePdf, invoiceQr, myInvoices, platformQr, searchInvoice } from '../controllers/invoice.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/platform-qr', platformQr);
router.get('/mine', requireAuth, myInvoices);
router.get('/search', requireAuth, searchInvoice);
router.get('/:id/qr', requireAuth, invoiceQr);
router.get('/:id/pdf', requireAuth, invoicePdf);

export default router;
