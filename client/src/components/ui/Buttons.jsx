import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  fullWidth = false,
  style = {},
  className = '',
  ...props
}) => {
  const buttonTypes = {
    primary: {
      backgroundColor: '#2c5530',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#1e3a22',
      hoverColor: 'white'
    },
    secondary: {
      backgroundColor: 'white',
      color: '#2c5530',
      border: '2px solid #2c5530',
      hoverBackgroundColor: '#2c5530',
      hoverColor: 'white'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#2c5530',
      border: '1px solid #2c5530',
      hoverBackgroundColor: '#2c5530',
      hoverColor: 'white'
    },
    danger: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#c82333',
      hoverColor: 'white'
    },
    success: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#218838',
      hoverColor: 'white'
    },
    warning: {
      backgroundColor: '#ffc107',
      color: '#212529',
      border: 'none',
      hoverBackgroundColor: '#e0a800',
      hoverColor: '#212529'
    },
    info: {
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      hoverBackgroundColor: '#138496',
      hoverColor: 'white'
    },
    pagination: {
      backgroundColor: 'white',
      color: '#495057',
      border: '1px solid #dee2e6',
      hoverBackgroundColor: '#e8f5e8',
      hoverColor: '#495057',
      hoverBorderColor: '#2c5530'
    },
    paginationActive: {
      backgroundColor: '#2c5530',
      color: 'white',
      border: '1px solid #2c5530',
      hoverBackgroundColor: '#2c5530',
      hoverColor: 'white'
    }
  };

  const buttonSizes = {
    small: {
      padding: '4px 8px',
      fontSize: '0.7rem',
      borderRadius: '4px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '0.75rem',
      borderRadius: '6px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '0.875rem',
      borderRadius: '8px'
    },
    pagination: {
      padding: '5px 7px',
      fontSize: '0.5rem',
      borderRadius: '4px'
    }
  };

  const buttonConfig = buttonTypes[type] || buttonTypes.primary;
  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  const baseStyle = {
    ...buttonConfig,
    ...sizeConfig,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const handleMouseOver = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = buttonConfig.hoverBackgroundColor;
      e.target.style.color = buttonConfig.hoverColor;
      if (buttonConfig.hoverBorderColor) {
        e.target.style.borderColor = buttonConfig.hoverBorderColor;
      }
    }
  };

  const handleMouseOut = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = buttonConfig.backgroundColor;
      e.target.style.color = buttonConfig.color;
      if (buttonConfig.hoverBorderColor) {
        e.target.style.borderColor = buttonConfig.border;
      }
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={baseStyle}
      className={className}
      disabled={disabled}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      {icon && <span style={{ fontSize: '0.875rem' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 