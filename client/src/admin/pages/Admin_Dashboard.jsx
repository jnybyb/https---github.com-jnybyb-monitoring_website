import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PersonalDetails from '../components/features/beneficiaries/Personal_Details';
import SeedlingRecords from '../components/features/seedlings/Seedling_Records';
import CropStatus from '../components/features/crop-status/Crop_Status';
import MapMonitoring from '../components/features/map-monitoring/MapMonitoring';
import { statisticsAPI } from '../services/api';

const AdminDashboard = () => {
  const [active, setActive] = useState('Dashboard');
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalSeedsDistributed: 0,
    totalAlive: 0,
    totalDead: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard') {
      fetchStats();
    }
  }, [active]);

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
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading statistics...</p>
            </div>
          ) : (
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
          )}
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