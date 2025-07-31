// 📁 routes/user.js
import express from 'express';
import {supabase}  from '../services_backend/supabasebackend.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error fetching user profile' });
    }

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; // ✅ THIS fixes the import issue
