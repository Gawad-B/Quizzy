import { Router } from 'express';
import { checkDbConnection } from '../config/db.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await checkDbConnection();
    res.json({ success: true, message: 'API and database are connected' });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

export default router;
