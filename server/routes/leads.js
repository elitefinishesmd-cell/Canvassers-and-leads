const express = require('express');
const { supabase } = require('../supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /api/leads — canvasser creates a lead
router.post('/', requireRole('canvasser', 'supervisor'), async (req, res) => {
  const { first_name, last_name, address, city, state, zip, phone, email, service_id, canvasser_notes } = req.body;

  if (!first_name || !last_name || !address || !phone || !service_id) {
    return res.status(400).json({ error: 'First name, last name, address, phone, and service are required' });
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      canvasser_id: req.user.id,
      first_name, last_name, address,
      city: city || 'Baltimore',
      state: state || 'MD',
      zip: zip || null,
      phone, email: email || null,
      service_id,
      canvasser_notes: canvasser_notes || null
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Log activity
  await supabase.from('lead_activity').insert({
    lead_id: lead.id,
    user_id: req.user.id,
    action: 'created',
    detail: `Lead created by ${req.user.name}`
  });

  res.status(201).json(lead);
});

// GET /api/leads — supervisor sees all leads
router.get('/', requireRole('supervisor'), async (req, res) => {
  const { status, page = 1, limit = 50, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('leads')
    .select(`
      *,
      services(name),
      canvasser:app_users!leads_canvasser_id_fkey(name)
    `, { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  // Flatten nested joins
  const leads = (data || []).map(l => ({
    ...l,
    service_name: l.services?.name,
    canvasser_name: l.canvasser?.name,
    services: undefined,
    canvasser: undefined
  }));

  res.json({ leads, total: count || 0, page: Number(page), limit: Number(limit) });
});

// GET /api/leads/mine — canvasser sees own leads
router.get('/mine', async (req, res) => {
  const { data, error } = await supabase
    .from('leads')
    .select(`*, services(name)`)
    .eq('canvasser_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const leads = (data || []).map(l => ({
    ...l,
    service_name: l.services?.name,
    services: undefined
  }));

  res.json(leads);
});

// GET /api/leads/services — list services for dropdown
router.get('/services', async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('id');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/leads/:id — single lead with appointment and activity
router.get('/:id', requireRole('supervisor', 'estimator'), async (req, res) => {
  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      services(name),
      canvasser:app_users!leads_canvasser_id_fkey(name)
    `)
    .eq('id', req.params.id)
    .single();

  if (error || !lead) return res.status(404).json({ error: 'Lead not found' });

  // Get appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`*, estimator:app_users!appointments_estimator_id_fkey(name)`)
    .eq('lead_id', lead.id)
    .maybeSingle();

  // Get activity
  const { data: activity } = await supabase
    .from('lead_activity')
    .select(`*, user:app_users!lead_activity_user_id_fkey(name)`)
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false });

  res.json({
    ...lead,
    service_name: lead.services?.name,
    canvasser_name: lead.canvasser?.name,
    services: undefined,
    canvasser: undefined,
    appointment: appointment ? {
      ...appointment,
      estimator_name: appointment.estimator?.name,
      estimator: undefined
    } : null,
    activity: (activity || []).map(a => ({
      ...a,
      user_name: a.user?.name,
      user: undefined
    }))
  });
});

// PATCH /api/leads/:id/status
router.patch('/:id/status', requireRole('supervisor'), async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['new', 'contacted', 'appointment_set', 'estimate_complete', 'won', 'lost', 'sold_lead'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data: lead, error: findErr } = await supabase
    .from('leads')
    .select('id')
    .eq('id', req.params.id)
    .single();

  if (findErr || !lead) return res.status(404).json({ error: 'Lead not found' });

  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });

  const detail = notes ? `Status → ${status}: ${notes}` : `Status → ${status}`;
  await supabase.from('lead_activity').insert({
    lead_id: lead.id, user_id: req.user.id, action: 'status_changed', detail
  });

  res.json({ ok: true });
});

// PATCH /api/leads/:id — update lead fields
router.patch('/:id', requireRole('supervisor'), async (req, res) => {
  const allowed = ['first_name', 'last_name', 'address', 'city', 'state', 'zip', 'phone', 'email', 'service_id', 'canvasser_notes'];
  const updates = {};

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('lead_activity').insert({
    lead_id: data.id, user_id: req.user.id, action: 'updated', detail: 'Lead details updated'
  });

  res.json(data);
});

module.exports = router;
