import React, { useState, useEffect } from 'react';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('checkin');

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentView('admin');
      } else if (path === '/dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('checkin');
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);

    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  switch (currentView) {
    case 'admin':
      return <QRGenerator />;
    case 'dashboard':
      return <AdminDashboard />;
    default:
      return <CheckInSystem />;
  }
}

export default App;