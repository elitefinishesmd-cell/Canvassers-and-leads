const express = require('express');
const cors = require('cors');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : true
    : 'http://localhost:5173',
  credentials: true
}));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/users', require('./routes/users'));

module.exports = app;
