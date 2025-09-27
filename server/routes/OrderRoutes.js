import { Router } from 'express';
const router = Router();

// Stub endpoints to keep integration working
router.get('/', (req, res) => res.json([]));
router.post('/', (req, res) => res.status(201).json({ ok: true }));

export default router;
