import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', pin: '', role: 'canvasser' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = () => {
    api.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createUser(form);
      setForm({ name: '', pin: '', role: 'canvasser' });
      setShowAdd(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const toggleActive = async (user) => {
    await api.updateUser(user.id, { is_active: !user.is_active });
    fetchUsers();
  };

  if (loading) return <p className="text-center text-gray-400 mt-12">Loading...</p>;

  const roleColors = {
    supervisor: 'text-blue-700 bg-blue-50 ring-blue-200',
    estimator: 'text-violet-700 bg-violet-50 ring-violet-200',
    canvasser: 'text-emerald-700 bg-emerald-50 ring-emerald-200'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-brand-900">Team</h2>
        <button onClick={() => setShowAdd(true)}
          className="bg-brand-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-800 transition-all shadow-sm">
          + Add
        </button>
      </div>

      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className={`bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center shadow-sm ${!user.is_active ? 'opacity-50' : ''}`}>
            <div>
              <p className="font-semibold text-brand-900">{user.name}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ${roleColors[user.role]}`}>
                {user.role}
              </span>
            </div>
            <button onClick={() => toggleActive(user)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                user.is_active
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
              }`}>
              {user.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {/* Add user modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-brand-900 mb-4">Add Team Member</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all" />
              <input placeholder="PIN (min 4 digits)" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
                type="password" inputMode="numeric" minLength={4} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all" />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all">
                <option value="canvasser">Canvasser</option>
                <option value="supervisor">Supervisor</option>
                <option value="estimator">Estimator</option>
              </select>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAdd(false); setError(''); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-brand-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-brand-900 text-white font-semibold disabled:opacity-40 transition-all shadow-lg shadow-brand-900/20">
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
