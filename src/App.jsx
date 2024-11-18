import React from 'react';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';

function App() {
  // Get the current path
  const isAdmin = window.location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-gray-100">
      {isAdmin ? <QRGenerator /> : <CheckInSystem />}
    </div>
  );
}

export default App;