// server/routes/signup.js
import express from 'express';
const router = express.Router();

// Example route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  // Handle signup
  res.status(200).json({ message: 'User registered successfully' });
});

export default router;
