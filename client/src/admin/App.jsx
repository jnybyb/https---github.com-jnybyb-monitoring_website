import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './Admin_Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/map-monitoring" element={<AdminDashboard />} />
        <Route path="/beneficiaries" element={<AdminDashboard />} />
        <Route path="/beneficiaries/personal-details" element={<AdminDashboard />} />
        <Route path="/beneficiaries/seedling-records" element={<AdminDashboard />} />
        <Route path="/beneficiaries/crop-status" element={<AdminDashboard />} />
        <Route path="/reports" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
