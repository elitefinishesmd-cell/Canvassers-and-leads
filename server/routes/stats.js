const express = require('express');
const { supabase } = require('../supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/stats/dashboard
router.get('/dashboard', requireRole('supervisor'), async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  const monthStart = today.substring(0, 7) + '-01';

  // Get all leads and count by status
  const { data: leads } = await supabase.from('leads').select('status, created_at');
  const allLeads = leads || [];

  const counts = {
    new: 0, contacted: 0, appointment_set: 0,
    estimate_complete: 0, won: 0, lost: 0, sold_lead: 0
  };
  let newToday = 0;
  let leadsThisMonth = 0;

  for (const l of allLeads) {
    if (counts[l.status] !== undefined) counts[l.status]++;
    const created = l.created_at.split('T')[0];
    if (created === today && l.status === 'new') newToday++;
    if (created >= monthStart) leadsThisMonth++;
  }

  // Appointments this week
  const { count: appointmentsThisWeek } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .gte('scheduled_date', weekStart)
    .lte('scheduled_date', weekEnd);

  res.json({
    new_today: newToday,
    total_new: counts.new,
    total_contacted: counts.contacted,
    total_appointment_set: counts.appointment_set,
    total_estimate_complete: counts.estimate_complete,
    total_won: counts.won,
    total_lost: counts.lost,
    total_sold: counts.sold_lead,
    appointments_this_week: appointmentsThisWeek || 0,
    leads_this_month: leadsThisMonth
  });
});

// GET /api/stats/new-lead-count — polling for badge
router.get('/new-lead-count', requireRole('supervisor'), async (req, res) => {
  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  res.json({ count: count || 0 });
});

function getWeekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function getWeekEnd(dateStr) {
  const start = getWeekStart(dateStr);
  const d = new Date(start + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

module.exports = router;
