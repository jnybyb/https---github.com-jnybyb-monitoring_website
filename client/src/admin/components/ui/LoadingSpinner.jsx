import React from 'react';

const LoadingSpinner = ({ size = '35px', color = 'var(--dark-green)' }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `3px solid #f3f3f3`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const keyframesStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div style={spinnerStyle}></div>
    </>
  );
};

export default LoadingSpinner; 