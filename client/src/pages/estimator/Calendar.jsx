import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Calendar() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const navigate = useNavigate();

  const getWeekDates = (offset) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const from = weekDates[0].toISOString().split('T')[0];
  const to = weekDates[6].toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    api.getAppointments(`from=${from}&to=${to}`)
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [from, to]);

  const today = new Date().toISOString().split('T')[0];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setWeekOffset(w => w - 1)} className="text-brand-500 hover:text-brand-900 font-medium px-2 py-1 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-brand-900">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h2>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-gold-500 font-medium">Back to today</button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} className="text-brand-500 hover:text-brand-900 font-medium px-2 py-1 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 mt-8">Loading...</p>
      ) : (
        <div className="space-y-1.5">
          {weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayAppts = appointments.filter(a => a.scheduled_date === dateStr);
            const isToday = dateStr === today;

            return (
              <div key={dateStr} className={`rounded-xl p-3 transition-all ${
                isToday
                  ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20'
                  : 'bg-white border border-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? 'text-gold-400' : 'text-gray-400'}`}>
                    {dayNames[i]}
                  </span>
                  <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-brand-900'}`}>
                    {date.getDate()}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-gold-500 text-brand-900' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {dayAppts.length}
                    </span>
                  )}
                </div>

                {dayAppts.length === 0 ? (
                  <p className={`text-xs pl-1 ${isToday ? 'text-gray-400' : 'text-gray-300'}`}>No estimates</p>
                ) : (
                  <div className="space-y-1.5 mt-2">
                    {dayAppts.map(appt => (
                      <button
                        key={appt.id}
                        onClick={() => navigate(`/estimates/${appt.id}`)}
                        className={`w-full text-left p-3 rounded-lg transition-all active:scale-[0.98] ${
                          appt.completed_at
                            ? isToday ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-100'
                            : isToday ? 'bg-white/10 border border-white/20' : 'bg-violet-50 border border-violet-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-semibold text-sm ${isToday && !appt.completed_at ? 'text-white' : isToday ? 'text-emerald-300' : 'text-brand-900'}`}>
                              {appt.scheduled_time?.slice(0,5)} — {appt.first_name} {appt.last_name}
                            </p>
                            <p className={`text-xs ${isToday ? 'text-gray-300' : 'text-gray-500'}`}>{appt.address}</p>
                            <p className={`text-xs ${isToday ? 'text-gray-400' : 'text-gray-400'}`}>{appt.service_name}</p>
                          </div>
                          {appt.completed_at && (
                            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-semibold">Done</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
