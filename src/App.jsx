import React, { useState, useEffect } from 'react';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';
import AdminDashboard from './components/AdminDashboard';
import DatabaseInit from './components/DatabaseInit';

function App() {
  const [currentPath, setCurrentPath] = useState('');
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname; setCurrentPath(path);
    };
    checkPath(); window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  const isAdmin = true;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CheckInSystem />} />
        <Route path="/admin" element={<QRGenerator />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        {isAdmin && <Route path="/admin/init" element={<DatabaseInit />} />}
      </Routes>
    </Router>);
} export default App;