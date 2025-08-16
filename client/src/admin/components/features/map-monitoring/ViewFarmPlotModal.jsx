import React from 'react';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const formStyle = {
  background: 'white',
  borderRadius: 12,
  padding: 0,
  minWidth: 500,
  maxWidth: 600,
  maxHeight: '85vh',
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
};

const headerStyle = {
  fontSize: 19,
  fontWeight: 600,
  margin: 0,
  padding: '20px 28px',
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0',
  color: '#2c5530',
  backgroundColor: 'white',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const closeBtnStyle = {
  position: 'absolute',
  top: 18,
  right: 18,
  background: 'none',
  border: 'none',
  fontSize: 21,
  color: '#888',
  cursor: 'pointer',
};

const contentStyle = {
  padding: '28px',
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const profileSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: 20,
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  border: '1px solid #e8f5e8',
};

const profileImageStyle = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  border: '3px solid #2d7c4a',
  objectFit: 'cover',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6c757d',
  fontSize: 24,
  fontWeight: 'bold',
};

const profileInfoStyle = {
  flex: 1,
};

const beneficiaryNameStyle = {
  fontSize: 20,
  fontWeight: 600,
  color: '#2c5530',
  marginBottom: 8,
};

const beneficiaryIdStyle = {
  fontSize: 16,
  color: '#6c757d',
  marginBottom: 8,
  fontWeight: 500,
};

const addressStyle = {
  fontSize: 14,
  color: '#495057',
  lineHeight: 1.4,
};

const fieldStyle = {
  marginBottom: 16,
};

const labelStyle = {
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 8,
  display: 'block',
  color: '#2c5530',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const valueStyle = {
  fontSize: 16,
  color: '#343a40',
  fontWeight: 500,
  padding: '12px 16px',
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  border: '1px solid #e9ecef',
  minHeight: '24px',
};

const locationSectionStyle = {
  padding: 20,
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  border: '1px solid #e8f5e8',
};

const locationTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: '#2c5530',
  marginBottom: 12,
};

const locationInfoStyle = {
  fontSize: 14,
  color: '#495057',
  lineHeight: 1.4,
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  marginTop: 20,
  paddingTop: 20,
  borderTop: '1px solid #e0e0e0',
};

const editButtonStyle = {
  background: '#2d7c4a',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
  transition: 'background-color 0.2s',
};

const deleteButtonStyle = {
  background: '#dc3545',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
  transition: 'background-color 0.2s',
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function ViewFarmPlotModal({ isOpen, onClose, plot, onEdit, onDelete, plotIndex }) {
  if (!isOpen || !plot) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(plot, plotIndex);
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to delete Plot #${plotIndex + 1}?`)) {
      onDelete(plot, plotIndex);
    }
  };

  // Calculate center point for location display
  const calculateCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    
    let sumLat = 0;
    let sumLng = 0;
    
    coordinates.forEach(coord => {
      sumLat += parseFloat(coord.lat);
      sumLng += parseFloat(coord.lng);
    });
    
    return {
      lat: (sumLat / coordinates.length).toFixed(6),
      lng: (sumLng / coordinates.length).toFixed(6)
    };
  };

  const centerPoint = calculateCenter(plot.coordinates);

  return (
    <div style={modalStyle}>
      <div style={formStyle}>
        <div style={headerStyle}>
          Farm Plot Details - Plot #{plotIndex + 1}
          <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div style={contentStyle}>
          {/* Profile Section */}
          <div style={profileSectionStyle}>
            <div style={profileImageStyle}>
              {plot.beneficiaryPicture ? (
                <img 
                  src={`http://localhost:5000${plot.beneficiaryPicture}`} 
                  alt="Profile" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                getInitials(plot.beneficiaryName)
              )}
            </div>
            <div style={profileInfoStyle}>
              <div style={beneficiaryNameStyle}>{plot.beneficiaryName || 'Unknown Beneficiary'}</div>
              <div style={beneficiaryIdStyle}>ID: {plot.beneficiaryId || 'N/A'}</div>
              <div style={addressStyle}>{plot.address || 'Address not available'}</div>
            </div>
          </div>

          {/* Plot Location Section */}
          <div style={locationSectionStyle}>
            <div style={locationTitleStyle}>Plot Location</div>
            <div style={locationInfoStyle}>
              {centerPoint ? (
                <>
                  <div><strong>Center Point:</strong></div>
                  <div>Latitude: {centerPoint.lat}</div>
                  <div>Longitude: {centerPoint.lng}</div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Boundary Points:</strong> {plot.coordinates?.length || 0} coordinates
                  </div>
                </>
              ) : (
                <div>Location information not available</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={buttonRowStyle}>
            <button 
              type="button" 
              style={editButtonStyle} 
              onClick={handleEdit}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1e5a3a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2d7c4a'}
            >
              Edit Plot
            </button>
            <button 
              type="button" 
              style={deleteButtonStyle} 
              onClick={handleDelete}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Delete Plot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewFarmPlotModal;
