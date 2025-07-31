import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/user.js';
import signupRoutes from './routes/signup.js';
import eventRoutes from './routes/events.js';
import userCategoriesRoutes from './routes/user_categories.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

console.log("🧠 Starting server...");

const app = express();

// ======================
// 🛡️ Error Handlers
// ======================
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err.stack || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'Reason:', reason);
  process.exit(1);
});

// ======================
// 🛠️ Middleware
// ======================
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ======================
// 🧩 Routes
// ======================
app.use('/api/user', userRoutes);             // /api/user/profile
app.use('/signup', signupRoutes);             // /signup
app.use('/api/events', eventRoutes);          // /api/events
app.use('/api/user_categories', userCategoriesRoutes); // /api/user_categories
app.use('/api/auth', authRoutes);             // /api/auth/login

// Test route
app.get('/test', (req, res) => {
  console.log("✅ /test route hit");
  res.send("Server is working!");
});

// ======================
// 🚨 Error Handling Middleware
// ======================
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ======================
// 🚀 Start Server
// ======================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('💥 Server Error:', err);
  process.exit(1);
});

console.log('🔋 Server initialized successfully');
