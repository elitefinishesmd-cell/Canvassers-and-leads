import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  const roleLabel = {
    supervisor: 'Supervisor',
    canvasser: 'Canvasser',
    estimator: 'Estimator',
  }[user?.role] || user?.role;

  return (
    <div className="min-h-screen flex flex-col pb-[4.5rem] bg-gray-50">
      {/* Top bar */}
      <header className="bg-brand-900 text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-brand-900/30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Elite Finishes" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight">Elite Finishes</h1>
            <p className="text-[11px] text-gray-400">{user?.name} <span className="text-gold-500">&middot;</span> {roleLabel}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
