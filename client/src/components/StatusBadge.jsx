const statusConfig = {
  new: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  contacted: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  appointment_set: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200' },
  estimate_complete: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  won: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  lost: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
  sold_lead: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
};

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  appointment_set: 'Appt Set',
  estimate_complete: 'Est. Complete',
  won: 'Won',
  lost: 'Lost',
  sold_lead: 'Sold Lead',
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      {statusLabels[status] || status}
    </span>
  );
}

export { statusLabels };
