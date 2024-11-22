import React, { useState, useEffect } from 'react';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';
import AdminDashboard from './components/AdminDashboard';
import DatabaseInit from './components/DatabaseInit';

function App() {
  const [currentPath, setCurrentPath] = useState('');
  { isAdmin && <Route path="/admin/init" element={<DatabaseInit />} /> }
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // Route handling
  switch (currentPath) {
    case '/admin':
      return <QRGenerator />;
    case '/dashboard':
      return <AdminDashboard />;
    default:
      return <CheckInSystem />;
  }
}

export default App;