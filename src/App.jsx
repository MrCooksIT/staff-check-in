import React, { useEffect, useState } from 'react';
import CheckInSystem from './components/CheckInSystem';
import QRGenerator from './components/QRGenerator';

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    console.log('Current path:', path);
    setCurrentPath(path);
    setIsAdmin(path === '/admin');
  }, []);

  console.log('Rendering App with:', {
    currentPath,
    isAdmin,
    rawPath: window.location.pathname
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {currentPath === '/admin' ? (
        <>
          <div className="p-4 bg-blue-100">
            <p>Admin Path Detected: {currentPath}</p>
          </div>
          <QRGenerator />
        </>
      ) : (
        <>
          <div className="p-4 bg-green-100">
            <p>Regular Path Detected: {currentPath}</p>
          </div>
          <CheckInSystem />
        </>
      )}
    </div>
  );
}

export default App;