import React from 'react';
import coffeeLogo from '../../assets/images/coffee crop logo.png';

// Header component with branding and user profile section
const Header = () => {
  // Main header container with shadow and fixed positioning
  const headerStyles = {
    background: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.3rem 0.7rem',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 7px var(--shadow-color)', 
    zIndex: 10, 
  };

  // Branding section with logo and text
  const brandingContainerStyles = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.20rem' 
  };

  const logoStyles = {
    height: '65px',
    width: 'auto',
  };

  const brandingTextStyles = {
    display: 'flex', 
    flexDirection: 'column'
  };

  // Main title styling
  const titleStyles = {
    fontWeight: 800, 
    fontSize: '1.5rem',
    letterSpacing: '0.1px',
    fontFamily: 'var(--font-main)',
    color: 'var(--dark-green)',
    lineHeight: '1.4'
  };

  // Subtitle styling
  const subtitleStyles = {
    fontWeight: 500, 
    fontSize: '0.75rem',
    letterSpacing: '0.3px',
    fontFamily: 'var(--font-main)',
    color: 'var(--dark-brown)',
    lineHeight: '1.1'
  };

  // User profile section
  const userContainerStyles = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem',
    padding: '0.5rem 1rem',
  };

  const userInfoStyles = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-end' 
  };

  const userRoleStyles = {
    fontWeight: 500, 
    fontSize: '1rem',
    color: 'var(--forest-green)',
    fontFamily: 'var(--font-main)'
  };

  // User avatar with initials
  const avatarStyles = {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'var(--mint-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--forest-green)',
    fontWeight: 700,
    fontSize: '1.2rem',
    fontFamily: 'var(--font-main)',
    boxShadow: '0 2px 4px var(--shadow-light)'
  };

  return (
    <header style={headerStyles}>
      <div style={brandingContainerStyles}>
        <img 
          src={coffeeLogo} 
          alt="Coffee Crop Logo" 
          style={logoStyles}
        />
        <div style={brandingTextStyles}>
          <span style={titleStyles}>
            Coffee Crop Monitoring System
          </span>
          <span style={subtitleStyles}>
            Taocanga, Manay, Davao Oriental
          </span>
        </div>
      </div>

      <div style={userContainerStyles}>
        <div style={userInfoStyles}>
          <span style={userRoleStyles}>
            Administrator
          </span>
        </div>
        <div style={avatarStyles}>
          AP
        </div>
      </div>
    </header>
  );
};

export default Header; 