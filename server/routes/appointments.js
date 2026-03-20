const express = require('express');
const { supabase } = require('../supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /api/appointments — supervisor schedules an estimate
router.post('/', requireRole('supervisor'), async (req, res) => {
  const { lead_id, estimator_id, scheduled_date, scheduled_time } = req.body;

  if (!lead_id || !estimator_id || !scheduled_date || !scheduled_time) {
    return res.status(400).json({ error: 'lead_id, estimator_id, scheduled_date, and scheduled_time are required' });
  }

  // Verify lead exists
  const { data: lead, error: leadErr } = await supabase
    .from('leads').select('id').eq('id', lead_id).single();
  if (leadErr || !lead) return res.status(404).json({ error: 'Lead not found' });

  // Verify estimator
  const { data: estimator, error: estErr } = await supabase
    .from('app_users').select('id, name').eq('id', estimator_id).eq('role', 'estimator').eq('is_active', true).single();
  if (estErr || !estimator) return res.status(400).json({ error: 'Invalid estimator' });

  // Check for existing appointment
  const { data: existing } = await supabase
    .from('appointments').select('id').eq('lead_id', lead_id).maybeSingle();

  if (existing) {
    await supabase.from('appointments').update({
      estimator_id, scheduled_date, scheduled_time, completed_at: null, outcome_notes: null
    }).eq('lead_id', lead_id);
  } else {
    await supabase.from('appointments').insert({
      lead_id, estimator_id, scheduled_date, scheduled_time
    });
  }

  // Update lead status
  await supabase.from('leads').update({
    status: 'appointment_set', updated_at: new Date().toISOString()
  }).eq('id', lead_id);

  // Log activity
  await supabase.from('lead_activity').insert({
    lead_id, user_id: req.user.id, action: 'appointment_set',
    detail: `Estimate scheduled for ${scheduled_date} at ${scheduled_time} with ${estimator.name}`
  });

  res.status(201).json({ ok: true });
});

// GET /api/appointments — estimator/supervisor sees appointments
router.get('/', requireRole('estimator', 'supervisor'), async (req, res) => {
  const { from, to } = req.query;

  let query = supabase
    .from('appointments')
    .select(`
      *,
      lead:leads(id, first_name, last_name, address, city, state, zip, phone, email, canvasser_notes, status,
        services(name)
      ),
      estimator:app_users!appointments_estimator_id_fkey(name)
    `);

  // Estimators only see their own
  if (req.user.role === 'estimator') {
    query = query.eq('estimator_id', req.user.id);
  }

  if (from) query = query.gte('scheduled_date', from);
  if (to) query = query.lte('scheduled_date', to);

  const { data, error } = await query.order('scheduled_date').order('scheduled_time');

  if (error) return res.status(500).json({ error: error.message });

  // Flatten
  const appointments = (data || []).map(a => ({
    ...a,
    first_name: a.lead?.first_name,
    last_name: a.lead?.last_name,
    address: a.lead?.address,
    city: a.lead?.city,
    state: a.lead?.state,
    zip: a.lead?.zip,
    phone: a.lead?.phone,
    email: a.lead?.email,
    canvasser_notes: a.lead?.canvasser_notes,
    lead_status: a.lead?.status,
    service_name: a.lead?.services?.name,
    estimator_name: a.estimator?.name,
    lead: undefined,
    estimator: undefined
  }));

  res.json(appointments);
});

// PATCH /api/appointments/:id/complete
router.patch('/:id/complete', requireRole('estimator', 'supervisor'), async (req, res) => {
  const { outcome_notes, outcome } = req.body;

  const { data: appointment, error: findErr } = await supabase
    .from('appointments').select('*').eq('id', req.params.id).single();
  if (findErr || !appointment) return res.status(404).json({ error: 'Appointment not found' });

  // Mark appointment complete
  await supabase.from('appointments').update({
    outcome_notes: outcome_notes || null,
    completed_at: new Date().toISOString()
  }).eq('id', req.params.id);

  // Update lead status
  const newStatus = outcome || 'estimate_complete';
  const validOutcomes = ['estimate_complete', 'won', 'lost', 'sold_lead'];
  if (!validOutcomes.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid outcome' });
  }

  await supabase.from('leads').update({
    status: newStatus, updated_at: new Date().toISOString()
  }).eq('id', appointment.lead_id);

  // Log activity
  await supabase.from('lead_activity').insert({
    lead_id: appointment.lead_id,
    user_id: req.user.id,
    action: 'estimate_complete',
    detail: `Estimate completed — ${newStatus}${outcome_notes ? ': ' + outcome_notes : ''}`
  });

  res.json({ ok: true });
});

module.exports = router;
