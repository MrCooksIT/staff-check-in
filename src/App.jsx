import React, { useState, useEffect } from 'react';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      setShowAdmin(path === '/admin');
    };

    checkPath();
    window.addEventListener('popstate', checkPath);

    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  if (showAdmin) {
    return <QRGenerator />;
  }

  return <CheckInSystem />;
}

export default App;