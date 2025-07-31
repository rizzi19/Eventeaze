// 📁 routes/user_categories.js
import express from 'express';
import {supabase}  from '../services_backend/supabasebackend.js'; // adjust the path if needed

const router = express.Router();

// POST /api/user_categories/bulk-add
router.post('/bulk-add', async (req, res) => {
  const { categories, business_type } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    // Get current user from token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Fetch username from 'users' table
    const { data: dbUser, error: userFetchError } = await supabase
      .from('users')
      .select('username')
      .eq('email', user.email)
      .single();

    if (userFetchError || !dbUser) {
      return res.status(404).json({ error: 'User not found in DB' });
    }

    const username = dbUser.username;

    // Construct rows to insert
    const rows = categories.map((category) => ({
      username,
      category,
      business_type,
    }));

    // Insert all at once
    const { error: insertError } = await supabase
      .from('user_categories')
      .insert(rows);

    if (insertError) {
      console.error('Insert error:', insertError.message);
      return res.status(500).json({ error: 'Failed to save preferences' });
    }

    return res.status(200).json({ message: 'Preferences saved successfully' });

  } catch (err) {
    console.error('❌ Bulk add error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
