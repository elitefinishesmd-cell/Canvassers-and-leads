import { useState, useEffect } from 'react';
import { api } from '../../api';

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-gray-400";

export default function NewLead() {
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', address: '', city: 'Baltimore', state: 'MD',
    zip: '', phone: '', email: '', service_id: '', canvasser_notes: ''
  });

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createLead({ ...form, service_id: Number(form.service_id) });
      setSuccess(true);
      setForm({
        first_name: '', last_name: '', address: '', city: 'Baltimore', state: 'MD',
        zip: '', phone: '', email: '', service_id: '', canvasser_notes: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-brand-900 mb-4">New Lead</h2>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 font-medium text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Lead submitted!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="First Name *" value={form.first_name} onChange={set('first_name')} required className={inputClass} />
          <input placeholder="Last Name *" value={form.last_name} onChange={set('last_name')} required className={inputClass} />
        </div>

        <input placeholder="Street Address *" value={form.address} onChange={set('address')} required className={inputClass} />

        <div className="grid grid-cols-3 gap-3">
          <input placeholder="City" value={form.city} onChange={set('city')} className={inputClass} />
          <input placeholder="State" value={form.state} onChange={set('state')} maxLength={2} className={inputClass} />
          <input placeholder="ZIP" value={form.zip} onChange={set('zip')} inputMode="numeric" className={inputClass} />
        </div>

        <input placeholder="Phone Number *" value={form.phone} onChange={set('phone')} type="tel" required className={inputClass} />
        <input placeholder="Email (optional)" value={form.email} onChange={set('email')} type="email" className={inputClass} />

        <select value={form.service_id} onChange={set('service_id')} required className={inputClass + " appearance-none"}>
          <option value="">Service Interested In *</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <textarea placeholder="Notes (anything useful from the conversation)"
          value={form.canvasser_notes} onChange={set('canvasser_notes')} rows={3}
          className={inputClass + " resize-none"} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold text-base hover:bg-brand-800 disabled:opacity-40 transition-all shadow-lg shadow-brand-900/20">
          {submitting ? 'Submitting...' : 'Submit Lead'}
        </button>
      </form>
    </div>
  );
}
