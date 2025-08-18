import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import separate page components
import AdminDashboard from './Admin_Dashboard';
import PersonalDetails from './components/features/beneficiaries/Personal_Details';
import SeedlingRecords from './components/features/seedlings/Seedling_Records';
import CropStatus from './components/features/crop-status/Crop_Status';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* All routes go through AdminDashboard to maintain sidebar and header */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/map-monitoring" element={<AdminDashboard />} />
        <Route path="/beneficiaries/personal-details" element={<AdminDashboard />} />
        <Route path="/beneficiaries/seedling-records" element={<AdminDashboard />} />
        <Route path="/beneficiaries/crop-status" element={<AdminDashboard />} />
        <Route path="/reports" element={<AdminDashboard />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
