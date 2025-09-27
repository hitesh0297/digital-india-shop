import { Router } from 'express';
import Product from '../src/models/Product.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) { next(e); }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (e) { next(e); }
});

export default router;
