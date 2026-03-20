import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import NewLead from './pages/canvasser/NewLead';
import MyLeads from './pages/canvasser/MyLeads';
import Dashboard from './pages/supervisor/Dashboard';
import AllLeads from './pages/supervisor/AllLeads';
import LeadDetail from './pages/supervisor/LeadDetail';
import UserManagement from './pages/supervisor/UserManagement';
import Calendar from './pages/estimator/Calendar';
import EstimateDetail from './pages/estimator/EstimateDetail';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <img src="/logo.png" alt="Elite Finishes" className="w-20 h-auto opacity-50 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const role = user.role;

  // Role-based home redirect
  const home = {
    canvasser: '/new-lead',
    supervisor: '/dashboard',
    estimator: '/calendar',
  }[role] || '/new-lead';

  return (
    <Layout>
      <Routes>
        {/* Canvasser routes */}
        {(role === 'canvasser' || role === 'supervisor') && (
          <>
            <Route path="/new-lead" element={<NewLead />} />
            <Route path="/my-leads" element={<MyLeads />} />
          </>
        )}

        {/* Supervisor routes */}
        {role === 'supervisor' && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/all-leads" element={<AllLeads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/users" element={<UserManagement />} />
          </>
        )}

        {/* Estimator routes */}
        {(role === 'estimator' || role === 'supervisor') && (
          <>
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/estimates/:id" element={<EstimateDetail />} />
          </>
        )}

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
