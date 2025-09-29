import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { config } from '../config/env.js';

const router = Router();

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  try {
    // pull fields from body
    const { name, email, password, role: rawRole, isSeller } = req.body; // rawRole may be "customer"/"seller"
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' }); // basic validation

    // normalize inputs
    const normEmail = String(email).toLowerCase(); // keep emails case-insensitive
    const requestedRole = (rawRole || (isSeller ? 'seller' : 'customer'))?.toString().toLowerCase(); // decide role
    const allowedRoles = new Set(['customer', 'seller']); // roles permitted on self-signup

    // security: never allow clients to create admin via this route
    if (!allowedRoles.has(requestedRole)) {
      return res.status(400).json({ error: 'Invalid role. Allowed: customer, seller' }); // reject "admin" or anything else
    }

    // uniqueness check
    const exists = await User.findOne({ email: normEmail });
    if (exists) return res.status(409).json({ error: 'Email already registered' }); // already taken

    // hash + create
    //const passwordHash = await hashPassword(password); // hash the password
    const user = await User.create({
      name: name.trim(), // store trimmed name
      email: normEmail,  // store normalized email
      password, // store hash
      role: requestedRole, // "customer" or "seller"
    });

    // respond with minimal profile
    return res.status(201).json({
      id: user._id.toString(), // expose id as string
      email: user.email,       // echo email
      name: user.name,         // echo name
      role: user.role,         // echo role
    });
  } catch (e) {
    next(e); // standard error handler
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +role');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { 
    next(e); 
  }
});

export default router;
