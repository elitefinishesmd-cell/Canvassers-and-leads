import { useState, useEffect } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

export default function MyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyLeads().then(setLeads).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-12">Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-bold text-brand-900 mb-4">My Leads <span className="text-brand-500 font-medium text-base">({leads.length})</span></h2>

      {leads.length === 0 ? (
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">No leads yet. Go knock some doors!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-900 truncate">{lead.first_name} {lead.last_name}</p>
                  <p className="text-sm text-gray-500 truncate">{lead.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lead.service_name}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-[11px] text-gray-300 mt-2">
                {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
