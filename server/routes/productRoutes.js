import { Router } from 'express';
import Product from '../src/models/Product.js';
import { createProduct, deleteProduct, getProducts, updateProduct, getSellersProducts } from '../controllers/productControllers.js';

const router = Router();

// GET /api/products
router.get('/', getProducts);

router.get('/seller', getSellersProducts)

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (e) { next(e); }
});

router.post('/create', createProduct);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

export default router;
