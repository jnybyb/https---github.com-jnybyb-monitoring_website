import React, { useState } from 'react';
import Layout from '../layout/Layout';
import PersonalDetails from '../features/beneficiaries/Personal_Details';
import SeedlingRecords from '../features/seedlings/Seedling_Records';
import CropStatus from '../features/crop-status/Crop_Status';
import MapMonitoring from '../features/map-monitoring/MapMonitoring';

const AdminDashboard = ({ onNavigateToPublic }) => {
  const [active, setActive] = useState('Dashboard');

  let content;
  
  switch (active) {
    case 'Map Monitoring':
      content = <MapMonitoring />;
      break;
    
    case 'Personal Details':
      content = <PersonalDetails />;
      break;
    
    case 'Seedling Records':
      content = <SeedlingRecords />;
      break;
    
    case 'Crop Status':
      content = <CropStatus />;
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
            <button
              onClick={onNavigateToPublic}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #2c5530',
                background: 'transparent',
                color: '#2c5530',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Back to Home
            </button>
          </div>
          <p>Welcome to the KAPPI Coffee Farm Monitoring Dashboard!</p>
        </div>
      );
  }

  return (
    <Layout active={active} setActive={setActive}>
      {content}
    </Layout>
  );
};

export default AdminDashboard;