import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function EstimateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [outcome, setOutcome] = useState('estimate_complete');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getAppointments().then(data => {
      const found = data.find(a => a.id === Number(id));
      setAppt(found || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.completeAppointment(id, { outcome, outcome_notes: notes });
      navigate('/calendar');
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <p className="text-center text-gray-400 mt-12">Loading...</p>;
  if (!appt) return <p className="text-center text-red-500 mt-12">Appointment not found</p>;

  return (
    <div>
      <button onClick={() => navigate('/calendar')} className="text-brand-500 text-sm mb-3 flex items-center gap-1 hover:text-brand-900 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Calendar
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
        <h2 className="text-xl font-bold text-brand-900 mb-0.5">{appt.first_name} {appt.last_name}</h2>
        <p className="text-sm text-violet-600 font-medium mb-4">
          {appt.scheduled_date} at {appt.scheduled_time?.slice(0,5)}
        </p>

        <div className="space-y-2.5">
          {/* Navigate */}
          <a href={`https://maps.google.com/?q=${encodeURIComponent(appt.address + ', ' + appt.city + ', ' + appt.state + ' ' + (appt.zip || ''))}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-blue-700 active:scale-[0.98] transition-all">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            <div>
              <p className="font-semibold text-sm">Navigate</p>
              <p className="text-xs text-blue-600">{appt.address}, {appt.city}, {appt.state} {appt.zip}</p>
            </div>
          </a>

          {/* Call */}
          <a href={`tel:${appt.phone}`} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-emerald-700 active:scale-[0.98] transition-all">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            <div>
              <p className="font-semibold text-sm">Call Customer</p>
              <p className="text-xs text-emerald-600">{appt.phone}</p>
            </div>
          </a>

          {/* Email */}
          {appt.email && (
            <a href={`mailto:${appt.email}`} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-brand-700 active:scale-[0.98] transition-all">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              <div>
                <p className="font-semibold text-sm">Email</p>
                <p className="text-xs text-gray-500">{appt.email}</p>
              </div>
            </a>
          )}

          {/* Service */}
          <div className="bg-gray-50 rounded-xl p-3.5">
            <p className="text-xs text-gray-400 font-medium">Service</p>
            <p className="text-sm font-semibold text-brand-900">{appt.service_name}</p>
          </div>

          {/* Canvasser notes */}
          {appt.canvasser_notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
              <p className="text-xs text-amber-600 font-semibold">Canvasser Notes</p>
              <p className="text-sm text-amber-900 mt-0.5">{appt.canvasser_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Complete button */}
      {!appt.completed_at ? (
        <>
          <button onClick={() => setShowComplete(true)}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            Mark Estimate Complete
          </button>

          {showComplete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-brand-900 mb-4">Complete Estimate</h3>
                <form onSubmit={handleComplete} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5">Outcome</label>
                    <select value={outcome} onChange={e => setOutcome(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500">
                      <option value="estimate_complete">Estimate Given</option>
                      <option value="won">Won - Job Booked!</option>
                      <option value="lost">Lost - Not Interested</option>
                      <option value="sold_lead">Sold Lead</option>
                    </select>
                  </div>
                  <textarea placeholder="Notes (estimate amount, details, reason lost, etc.)"
                    value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500 resize-none" />
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowComplete(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-brand-600 hover:bg-gray-50 transition-all">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20">
                      {saving ? 'Saving...' : 'Complete'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-emerald-700 font-semibold">Estimate Completed</p>
          {appt.outcome_notes && <p className="text-sm text-emerald-600 mt-1">{appt.outcome_notes}</p>}
        </div>
      )}
    </div>
  );
}
