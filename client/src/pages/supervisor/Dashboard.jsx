import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-12">Loading...</p>;
  if (!stats) return <p className="text-center text-red-500 mt-12">Failed to load stats</p>;

  const cards = [
    { label: 'New Today', value: stats.new_today, dot: 'bg-amber-400', onClick: () => navigate('/all-leads?status=new') },
    { label: 'Total New', value: stats.total_new, dot: 'bg-amber-500', onClick: () => navigate('/all-leads?status=new') },
    { label: 'Contacted', value: stats.total_contacted, dot: 'bg-blue-500', onClick: () => navigate('/all-leads?status=contacted') },
    { label: 'Appt Set', value: stats.total_appointment_set, dot: 'bg-violet-500', onClick: () => navigate('/all-leads?status=appointment_set') },
    { label: 'Est. Complete', value: stats.total_estimate_complete, dot: 'bg-indigo-500', onClick: () => navigate('/all-leads?status=estimate_complete') },
    { label: 'Won', value: stats.total_won, dot: 'bg-emerald-500', onClick: () => navigate('/all-leads?status=won') },
    { label: 'Lost', value: stats.total_lost, dot: 'bg-red-500', onClick: () => navigate('/all-leads?status=lost') },
    { label: 'Sold', value: stats.total_sold, dot: 'bg-orange-500', onClick: () => navigate('/all-leads?status=sold_lead') },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-brand-900 mb-4">Dashboard</h2>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {cards.map(c => (
          <button key={c.label} onClick={c.onClick}
            className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md transition-all active:scale-[0.98]">
            <p className="text-2xl font-bold text-brand-900">{c.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="text-xs text-brand-500">{c.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-brand-500">Appointments this week</span>
          <span className="text-sm font-bold text-brand-900">{stats.appointments_this_week}</span>
        </div>
        <div className="border-t border-gray-100" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-brand-500">Leads this month</span>
          <span className="text-sm font-bold text-brand-900">{stats.leads_this_month}</span>
        </div>
      </div>
    </div>
  );
}
