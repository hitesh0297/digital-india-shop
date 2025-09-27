import { Router } from 'express';
import Product from '../models/Product.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public list
router.get('/', async (req, res, next) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) { next(e); }
});

// Create (admin only)
router.post('/', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, price, image, stock } = req.body;
    const product = await Product.create({ title, description, price, image, stock });
    res.status(201).json(product);
  } catch (e) { next(e); }
});

export default router;
