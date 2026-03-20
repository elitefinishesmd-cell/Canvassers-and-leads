const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/users
router.get('/', requireRole('supervisor'), async (req, res) => {
  const { data, error } = await supabase
    .from('app_users')
    .select('id, name, role, is_active, created_at')
    .order('role')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/users/estimators
router.get('/estimators', requireRole('supervisor'), async (req, res) => {
  const { data, error } = await supabase
    .from('app_users')
    .select('id, name')
    .eq('role', 'estimator')
    .eq('is_active', true)
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/users
router.post('/', requireRole('supervisor'), async (req, res) => {
  const { name, pin, role } = req.body;

  if (!name || !pin || !role) {
    return res.status(400).json({ error: 'Name, PIN, and role are required' });
  }

  const validRoles = ['canvasser', 'supervisor', 'estimator'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (pin.length < 4) {
    return res.status(400).json({ error: 'PIN must be at least 4 digits' });
  }

  // Check for existing user
  const { data: existing } = await supabase
    .from('app_users').select('id').eq('name', name).maybeSingle();
  if (existing) {
    return res.status(400).json({ error: 'A user with that name already exists' });
  }

  const hash = bcrypt.hashSync(pin, 10);
  const { data, error } = await supabase
    .from('app_users')
    .insert({ name, pin_hash: hash, role })
    .select('id, name, role, is_active')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/users/:id
router.patch('/:id', requireRole('supervisor'), async (req, res) => {
  const updates = {};

  if (req.body.is_active !== undefined) {
    updates.is_active = !!req.body.is_active;
  }

  if (req.body.pin) {
    updates.pin_hash = bcrypt.hashSync(req.body.pin, 10);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const { data, error } = await supabase
    .from('app_users')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, name, role, is_active, created_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
