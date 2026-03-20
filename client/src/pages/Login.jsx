import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Login() {
  const { login } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.usersList().then(setUsers).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(selectedUser, pin);
    } catch (err) {
      setError('Invalid PIN. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <img src="/logo.png" alt="Elite Finishes" className="w-32 h-auto mx-auto" />
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-brand-900 tracking-tight">Sign In</h1>
          <p className="text-sm text-blue-500 mt-1">Lead Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5">Name</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              required
            >
              <option value="">Select your name</option>
              {users.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="----"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.4em] bg-gray-50 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm text-center px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedUser || !pin}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="text-gray-400 text-xs mt-6">Elite Finishes Painting & Remodeling</p>
    </div>
  );
}
