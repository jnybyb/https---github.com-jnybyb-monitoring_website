import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PersonalDetailsTable from './components/features/beneficiaries/Personal_Details';
import SeedlingRecordsTable from './components/features/seedlings/Seedling_Records';
import CropStatusTable from './components/features/crop-status/Crop_Status';
import MapMonitoring from './components/features/map-monitoring/MapMonitoring';
import { getActiveFromPath, navigateToPage } from './utils/navigation';
import { useStatistics } from './hooks/useStatistics';

// Dashboard Content Component
const DashboardContent = ({ active }) => {
  const { stats, loading } = useStatistics(active);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Total Beneficiaries */}
      <div style={{
        background: 'linear-gradient(135deg, #e8f4fd 0%, #d1e7dd 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: '#2c5530',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.7, fontWeight: '500' }}>Total Beneficiaries</h3>
        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#2c5530' }}>{stats.totalBeneficiaries}</p>
      </div>

      {/* Total Seeds Distributed */}
      <div style={{
        background: 'linear-gradient(135deg, #fff3cd 0%, #f8d7da 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: '#2c5530',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.7, fontWeight: '500' }}>Total Seeds Distributed</h3>
        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#2c5530' }}>{stats.totalSeedsDistributed.toLocaleString()}</p>
      </div>

      {/* Alive Crops */}
      <div style={{
        background: 'linear-gradient(135deg, #d1e7dd 0%, #cff4fc 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: '#2c5530',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.7, fontWeight: '500' }}>Alive Crops</h3>
        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#2c5530' }}>{stats.totalAlive.toLocaleString()}</p>
      </div>

      {/* Dead Crops */}
      <div style={{
        background: 'linear-gradient(135deg, #f8d7da 0%, #fff3cd 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: '#2c5530',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.7, fontWeight: '500' }}>Dead Crops</h3>
        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#2c5530' }}>{stats.totalDead.toLocaleString()}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = getActiveFromPath(location.pathname);

  const handleNavigate = (page) => {
    navigateToPage(page, navigate);
  };

  // Render content based on active page
  let content;
  
  switch (active) {
    case 'Map Monitoring':
      content = <MapMonitoring />;
      break;
    
    case 'Coffee Beneficiaries':
      // When Coffee Beneficiaries is clicked, show Personal Details by default
      content = <PersonalDetailsTable />;
      break;
    
    case 'Personal Details':
      content = <PersonalDetailsTable />;
      break;
    
    case 'Seedling Records':
      content = <SeedlingRecordsTable />;
      break;
    
    case 'Crop Status':
      content = <CropStatusTable />;
      break;
    
    case 'Reports':
      content = (
        <div style={{ 
          padding: '2rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#2c5530' }}>Reports</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Reports functionality coming soon...</p>
          </div>
        </div>
      );
      break;
    
    default:
      content = (
        <div style={{ 
          padding: '2rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#2c5530' }}>Dashboard</h2>
          </div>
          <DashboardContent active={active} />
        </div>
      );
  }

  return (
    <Layout active={active} setActive={handleNavigate}>
      <div className="admin-content">
        {content}
      </div>
    </Layout>
  );
};

export default AdminDashboard;