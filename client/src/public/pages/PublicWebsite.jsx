import React from 'react';
import bgImage from '../../assets/images/bg1.png';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const PublicWebsite = () => {
  const handleNavigateToDashboard = () => {
    // Open admin website in a new tab/window on port 3001
    window.open('http://localhost:3001', '_blank');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <PublicHeader />
      
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />
      
      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2,
        }}
      />
      
      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flex: 1,
          padding: '2rem',
          paddingTop: '6rem', // Account for fixed header
        }}
      >
        <div
          className="p-8 rounded-2xl shadow-lg max-w-2xl text-left mx-4"
          style={{
            color: '#fff',
            background: 'none',
          }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'inherit' }}
          >
            Welcome to KAPPI
          </h1>
          <p
            className="text-lg md:text-xl"
            style={{ color: 'inherit' }}
          >
            A Coffee Farm Monitoring Website for Taocanga, Manay, Davao Oriental.
          </p>
          
          {/* Additional public website content */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.9 }}>
              Discover the rich coffee heritage of our region and learn about sustainable farming practices 
              that support local communities and preserve our environment.
            </p>
            
            {/* Admin Dashboard Button */}
            <button
              onClick={handleNavigateToDashboard}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2c5530',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3a23'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2c5530'}
            >
              Access Admin Dashboard
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicWebsite;
