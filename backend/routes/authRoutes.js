import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findByEmail } from '../services/userStore.js';

const router = Router();
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sign = (u) => jwt.sign({ id: u.id, email: u.email, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (!emailRx.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (findByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });
    const user = createUser({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

export default router;
