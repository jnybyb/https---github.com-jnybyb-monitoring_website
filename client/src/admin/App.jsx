import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

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

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* All routes go through AdminDashboard to maintain sidebar and header */}
        <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/map-monitoring" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/beneficiaries/personal-details" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/beneficiaries/seedling-records" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/beneficiaries/crop-status" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
