import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import StatusBadge, { statusLabels } from '../../components/StatusBadge';

const STATUSES = ['all', 'new', 'contacted', 'appointment_set', 'estimate_complete', 'won', 'lost', 'sold_lead'];

export default function AllLeads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status') || 'all';

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const data = await api.getLeads(params.toString());
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-brand-900 mb-3">All Leads <span className="text-brand-500 font-medium text-base">({total})</span></h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input
            placeholder="Search name, address, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
          />
        </div>
      </form>

      {/* Status tabs */}
      <div className="flex overflow-x-auto gap-1.5 mb-4 pb-1 -mx-4 px-4 scrollbar-none">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setSearchParams(s === 'all' ? {} : { status: s })}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              status === s
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-brand-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Leads list */}
      {loading ? (
        <p className="text-center text-gray-400 mt-8">Loading...</p>
      ) : leads.length === 0 ? (
        <p className="text-gray-400 text-center mt-12 text-sm">No leads found</p>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => (
            <button
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="w-full bg-white rounded-xl border border-gray-100 p-3.5 text-left hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-900 truncate">{lead.first_name} {lead.last_name}</p>
                  <p className="text-sm text-gray-500 truncate">{lead.address}</p>
                  <p className="text-xs text-gray-400">{lead.service_name} &middot; {lead.canvasser_name}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
