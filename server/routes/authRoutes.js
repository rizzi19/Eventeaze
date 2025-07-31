// 📁 routes/authRoutes.js
// 📁 routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {supabase} from '../services_backend/supabasebackend.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Fetch user by username OR email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier},email.eq.${identifier}`);

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
