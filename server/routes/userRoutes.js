//TODO: Redundant
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

export default router;
