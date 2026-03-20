import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import StatusBadge, { statusLabels } from '../../components/StatusBadge';

const STATUSES = ['new', 'contacted', 'appointment_set', 'estimate_complete', 'won', 'lost', 'sold_lead'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [estimators, setEstimators] = useState([]);
  const [schedForm, setSchedForm] = useState({ estimator_id: '', scheduled_date: '', scheduled_time: '' });
  const [statusNote, setStatusNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLead = () => {
    api.getLead(id).then(setLead).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await api.updateLeadStatus(id, newStatus, statusNote);
      setStatusNote('');
      fetchLead();
    } catch (e) {}
    setSaving(false);
  };

  const openSchedule = async () => {
    const ests = await api.getEstimators();
    setEstimators(ests);
    if (ests.length === 1) setSchedForm(f => ({ ...f, estimator_id: String(ests[0].id) }));
    setShowSchedule(true);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAppointment({
        lead_id: Number(id),
        estimator_id: Number(schedForm.estimator_id),
        scheduled_date: schedForm.scheduled_date,
        scheduled_time: schedForm.scheduled_time
      });
      setShowSchedule(false);
      fetchLead();
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <p className="text-center text-gray-400 mt-12">Loading...</p>;
  if (!lead) return <p className="text-center text-red-500 mt-12">Lead not found</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-brand-500 text-sm mb-3 flex items-center gap-1 hover:text-brand-900 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back
      </button>

      {/* Lead info card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-brand-900">{lead.first_name} {lead.last_name}</h2>
          <StatusBadge status={lead.status} />
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            <span className="text-brand-800">{lead.address}, {lead.city}, {lead.state} {lead.zip}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            <a href={`tel:${lead.phone}`} className="text-blue-600 font-medium">{lead.phone}</a>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              <a href={`mailto:${lead.email}`} className="text-blue-600">{lead.email}</a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.007-3.378a1.222 1.222 0 01-.378-.378l-.098-.18a1.222 1.222 0 01.294-1.508l.1-.078 5.089-3.434a1.222 1.222 0 011.378.052l.076.066 5.007 3.378a1.222 1.222 0 01.378.378l.098.18a1.222 1.222 0 01-.294 1.508l-.1.078-5.089 3.434a1.222 1.222 0 01-1.378-.052l-.076-.066z" /></svg>
            <span className="text-brand-800">{lead.service_name}</span>
          </div>
          <p className="text-xs text-gray-400">Canvasser: {lead.canvasser_name}</p>
          {lead.canvasser_notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">Notes</p>
              <p className="text-sm text-amber-900">{lead.canvasser_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment info */}
      {lead.appointment && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-3">
          <p className="font-semibold text-violet-900 text-sm mb-1">Estimate Scheduled</p>
          <p className="text-sm text-violet-700">{lead.appointment.scheduled_date} at {lead.appointment.scheduled_time}</p>
          <p className="text-xs text-violet-600">Estimator: {lead.appointment.estimator_name}</p>
          {lead.appointment.completed_at && (
            <p className="text-xs text-emerald-600 mt-1.5 font-semibold">Completed {new Date(lead.appointment.completed_at).toLocaleDateString()}</p>
          )}
          {lead.appointment.outcome_notes && (
            <p className="text-xs text-violet-600 mt-1">Notes: {lead.appointment.outcome_notes}</p>
          )}
        </div>
      )}

      {/* Status update */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2.5">Update Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.filter(s => s !== lead.status).map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-brand-700 border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-all active:scale-95">
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule button */}
      {!lead.appointment && (
        <button onClick={openSchedule}
          className="w-full bg-violet-600 text-white py-3.5 rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 mb-3">
          Schedule Estimate
        </button>
      )}
      {lead.appointment && !lead.appointment.completed_at && (
        <button onClick={openSchedule}
          className="w-full bg-violet-50 text-violet-700 border border-violet-200 py-3.5 rounded-xl font-semibold hover:bg-violet-100 transition-all mb-3">
          Reschedule Estimate
        </button>
      )}

      {/* Schedule modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-brand-900 mb-4">Schedule Estimate</h3>
            <form onSubmit={handleSchedule} className="space-y-3">
              <select value={schedForm.estimator_id} onChange={e => setSchedForm(f => ({ ...f, estimator_id: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500">
                <option value="">Select Estimator</option>
                {estimators.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <input type="date" value={schedForm.scheduled_date} onChange={e => setSchedForm(f => ({ ...f, scheduled_date: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500" />
              <input type="time" value={schedForm.scheduled_time} onChange={e => setSchedForm(f => ({ ...f, scheduled_time: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500" />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowSchedule(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-brand-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold disabled:opacity-40 transition-all shadow-lg shadow-violet-600/20">
                  {saving ? 'Saving...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity timeline */}
      {lead.activity && lead.activity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">Activity</p>
          <div className="space-y-3">
            {lead.activity.map(a => (
              <div key={a.id} className="text-sm border-l-2 border-gray-200 pl-3">
                <p className="text-brand-800">{a.detail}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{a.user_name} &middot; {new Date(a.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
