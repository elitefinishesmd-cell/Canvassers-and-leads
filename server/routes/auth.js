const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../supabase');
const { requireAuth, signToken, setTokenCookie, clearTokenCookie } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { name, pin } = req.body;
  if (!name || !pin) {
    return res.status(400).json({ error: 'Name and PIN are required' });
  }

  const { data: user, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(pin, user.pin_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id);
  setTokenCookie(res, token);
  res.json({ id: user.id, name: user.name, role: user.role });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// GET /api/auth/users-list — names for login dropdown (no auth)
router.get('/users-list', async (req, res) => {
  const { data, error } = await supabase
    .from('app_users')
    .select('id, name, role')
    .eq('is_active', true)
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
