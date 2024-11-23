import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';
import AdminDashboard from './components/AdminDashboard';
import DatabaseInit from './components/DatabaseInit';
import Login from './components/Login';
import AdminSetup from './components/AdminSetup';
import StaffManagement from './components/pages/StaffManagement';
import Attendance from './components/pages/Attendance';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CheckInSystem />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<QRGenerator />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/init"
            element={
              <ProtectedRoute>
                <DatabaseInit />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;