import React, { useState } from 'react';
import PublicWebsite from './components/pages/PublicWebsite';
import AdminDashboard from './components/pages/Admin_Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('public');

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleNavigateToPublic = () => {
    setCurrentView('public');
  };

  return (
    <div className="App">
      {currentView === 'public' ? (
        <PublicWebsite onNavigateToDashboard={handleNavigateToDashboard} />
      ) : (
        <AdminDashboard onNavigateToPublic={handleNavigateToPublic} />
      )}
    </div>
  );
}

export default App;