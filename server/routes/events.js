// 📁 routes/userCategories.js
import express from 'express';
import  {supabase}  from '../services_backend/supabasebackend.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to extract user from token
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.username = decoded.username; // assumes username is in token
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// POST route to insert user preferences (bulk add)
router.post('/bulk-add', authenticateUser, async (req, res) => {
  const { categories, business_type } = req.body;
  const username = req.username;

  if (!categories || !Array.isArray(categories) || !business_type) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Remove previous entries for this user (optional: avoids duplicates)
    await supabase.from('user_categories').delete().eq('username', username);

    // Insert all selected categories
    const inserts = categories.map((category) => ({
      username,
      category,
      business_type,
    }));

    const { error } = await supabase.from('user_categories').insert(inserts);

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Failed to save preferences' });
    }

    return res.json({ message: 'Preferences saved successfully' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
