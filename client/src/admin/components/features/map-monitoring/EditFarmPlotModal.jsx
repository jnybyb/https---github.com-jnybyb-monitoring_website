import React, { useState, useEffect } from 'react';

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
  padding: 28,
  minWidth: 450,
  maxWidth: 500,
  maxHeight: '80vh',
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  position: 'relative',
  overflow: 'auto',
};

const headerStyle = {
  fontSize: 19,
  fontWeight: 600,
  marginBottom: 8,
  marginTop: 0,
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0',
  paddingBottom: 12,
  color: '#2c5530',
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

const labelStyle = {
  fontWeight: 500,
  fontSize: 13,
  marginBottom: 4,
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
  marginBottom: 0,
  background: 'white',
};

const readOnlyInputStyle = {
  ...inputStyle,
  background: '#f5f5f5',
  color: '#888',
  cursor: 'not-allowed',
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 18,
};

const cancelBtnStyle = {
  background: '#eee',
  border: 'none',
  borderRadius: 6,
  padding: '10px 24px',
  color: '#333',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 14,
};

const saveBtnStyle = {
  background: '#2d7c4a',
  border: 'none',
  borderRadius: 6,
  padding: '10px 24px',
  color: 'white',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 14,
};

const addButtonStyle = {
  background: '#e8f5e8',
  border: '1px solid #2d7c4a',
  borderRadius: 6,
  padding: '8px 16px',
  color: '#2d7c4a',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 13,
  marginTop: 8,
};

const coordinateRowStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  padding: '8px 12px',
  backgroundColor: '#f8f9fa',
  borderRadius: 6,
  marginBottom: 8,
  border: '1px solid #e9ecef',
};

const removeButtonStyle = {
  background: '#dc3545',
  border: 'none',
  borderRadius: 4,
  padding: '4px 8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold',
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '20px',
};

const sectionTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#2c5530',
  marginBottom: 8,
  marginTop: 16,
};

const pointTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#2c5530',
  marginBottom: 8,
};

const coordinateInputStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
};

const coordinateFieldsStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
};

const plotNameInputStyle = {
  ...inputStyle,
  fontSize: 16,
  fontWeight: 500,
  color: '#2c5530',
};

// Helper function to convert DMS to Decimal Degrees
const dmsToDecimal = (dmsString) => {
  if (!dmsString) return null;
  
  // Match DMS format: 7°15'20.4"N or 126°20'36.5"E
  const regex = /([0-9.]+)[°\s]+([0-9.]+)?['\s]*([0-9.]+)?["\s]*([NSEW])?/i;
  const match = dmsString.match(regex);
  
  if (!match) return null;
  
  let degrees = parseFloat(match[1] || 0);
  let minutes = parseFloat(match[2] || 0);
  let seconds = parseFloat(match[3] || 0);
  let direction = match[4] || '';
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Apply direction
  if (direction.toUpperCase() === 'S' || direction.toUpperCase() === 'W') {
    decimal *= -1;
  }
  
  return decimal;
};

// Helper function to detect coordinate format
const detectCoordinateFormat = (coordString) => {
  if (!coordString) return 'decimal';
  
  // Check if it contains DMS indicators (°, ', ")
  if (coordString.includes('°') || coordString.includes("'") || coordString.includes('"')) {
    return 'dms';
  }
  
  // Check if it's a valid decimal number
  const decimal = parseFloat(coordString);
  if (!isNaN(decimal)) {
    return 'decimal';
  }
  
  return 'unknown';
};

function EditFarmPlotModal({ isOpen, onClose, onSubmit, plot, beneficiaries, isLoading = false }) {
  const [plotNumber, setPlotNumber] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [coordinates, setCoordinates] = useState([
    { lat: '', lng: '' },
    { lat: '', lng: '' },
    { lat: '', lng: '' }
  ]);
  const [errors, setErrors] = useState({});

  // Find selected beneficiary object
  const selected = beneficiaries?.find(b => b.beneficiaryId === selectedId || b.id === selectedId) || {};

  // Initialize form data when plot changes
  useEffect(() => {
    if (plot && isOpen) {
      setPlotNumber(plot.plotNumber || '');
      setSelectedId(plot.beneficiaryId || '');
      
      // Initialize coordinates from existing plot data
      if (plot.coordinates && Array.isArray(plot.coordinates)) {
        const plotCoordinates = plot.coordinates.map(coord => ({
          lat: coord.lat?.toString() || '',
          lng: coord.lng?.toString() || ''
        }));
        
        // Ensure minimum 3 coordinates
        while (plotCoordinates.length < 3) {
          plotCoordinates.push({ lat: '', lng: '' });
        }
        
        setCoordinates(plotCoordinates);
      } else {
        setCoordinates([
          { lat: '', lng: '' },
          { lat: '', lng: '' },
          { lat: '', lng: '' }
        ]);
      }
      
      setErrors({});
    }
  }, [plot, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPlotNumber('');
      setSelectedId('');
      setCoordinates([
        { lat: '', lng: '' },
        { lat: '', lng: '' },
        { lat: '', lng: '' }
      ]);
      setErrors({});
    }
  }, [isOpen]);

  const addCoordinate = () => {
    setCoordinates([...coordinates, { lat: '', lng: '' }]);
  };

  const removeCoordinate = (index) => {
    // Only allow removal if we have more than 3 coordinates
    if (coordinates.length > 3) {
      setCoordinates(coordinates.filter((_, i) => i !== index));
    }
  };

  const updateCoordinate = (index, field, value) => {
    const updated = [...coordinates];
    updated[index][field] = value;
    setCoordinates(updated);
  };

  const validateAndConvertCoordinates = (coordinates) => {
    const validCoordinates = [];
    
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      if (!coord.lat || !coord.lng) continue;
      
      let lat, lng;
      
      // Detect and convert latitude
      const latFormat = detectCoordinateFormat(coord.lat);
      if (latFormat === 'dms') {
        lat = dmsToDecimal(coord.lat);
      } else if (latFormat === 'decimal') {
        lat = parseFloat(coord.lat);
      } else {
        throw new Error(`Invalid latitude format at point ${i + 1}`);
      }
      
      // Detect and convert longitude
      const lngFormat = detectCoordinateFormat(coord.lng);
      if (lngFormat === 'dms') {
        lng = dmsToDecimal(coord.lng);
      } else if (lngFormat === 'decimal') {
        lng = parseFloat(coord.lng);
      } else {
        throw new Error(`Invalid longitude format at point ${i + 1}`);
      }
      
      // Validate ranges
      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error(`Invalid latitude value at point ${i + 1} (must be between -90 and 90)`);
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error(`Invalid longitude value at point ${i + 1} (must be between -180 and 180)`);
      }
      
      validCoordinates.push({ lat, lng });
    }
    
    return validCoordinates;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent submission while loading
    
    const newErrors = {};
    
    if (!plotNumber.trim()) {
      newErrors.plotNumber = 'Plot number is required';
    }
    
    if (!selectedId) {
      newErrors.selectedId = 'Beneficiary is required';
    }
    
    // Validate coordinates
    const validCoordinates = coordinates.filter(coord => coord.lat && coord.lng);
    if (validCoordinates.length < 3) {
      newErrors.coordinates = 'At least 3 coordinate points are required to define a plot boundary';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Convert and validate all coordinates
      const convertedCoordinates = validateAndConvertCoordinates(validCoordinates);
      
      onSubmit({
        id: plot.id, // Keep the original plot ID
        plotNumber: plotNumber.trim(),
        beneficiaryId: selected.beneficiaryId || selected.id,
        fullName: selected.fullName || selected.name,
        address: selected.address,
        coordinates: convertedCoordinates,
        color: plot.color, // Keep the original color
      });
      
      onClose();
    } catch (error) {
      newErrors.coordinates = error.message;
      setErrors(newErrors);
    }
  };

  if (!isOpen || !plot) return null;

  return (
    <div style={modalStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="Close">×</button>
        <div style={headerStyle}>Edit Farm Plot</div>
        
        {/* Plot Number */}
        <div>
          <label style={labelStyle}>Plot Number</label>
          <input
            style={plotNameInputStyle}
            type="text"
            value={plotNumber}
            onChange={e => setPlotNumber(e.target.value)}
            placeholder="Enter plot number"
            required
          />
          {errors.plotNumber && <div style={{ color: '#c00', fontSize: 12 }}>{errors.plotNumber}</div>}
        </div>

        {/* Beneficiary Selection */}
        <div>
          <label style={labelStyle}>Beneficiary Full Name</label>
          <select
            style={inputStyle}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            required
          >
            <option value="">Select beneficiary</option>
            {beneficiaries?.map(b => (
              <option key={b.beneficiaryId || b.id} value={b.beneficiaryId || b.id}>
                {b.fullName || b.name || `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim()}
              </option>
            ))}
          </select>
          {errors.selectedId && <div style={{ color: '#c00', fontSize: 12 }}>{errors.selectedId}</div>}
        </div>

        {/* Beneficiary ID (Read-only) */}
        <div>
          <label style={labelStyle}>Beneficiary ID</label>
          <input
            style={readOnlyInputStyle}
            value={selected.beneficiaryId || selected.id || ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Address (Read-only) */}
        <div>
          <label style={labelStyle}>Address</label>
          <input
            style={readOnlyInputStyle}
            value={selected.address || `${selected.purok || ''}, ${selected.barangay || ''}, ${selected.municipality || ''}, ${selected.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',') || ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Plot Boundary Coordinates */}
        <div>
          <div style={sectionTitleStyle}>Plot Boundary Coordinates</div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Edit coordinate points to define the plot boundary. Minimum 3 points required.
            <br />
            <strong>Supported formats:</strong>
            <br />
            • Decimal: 7.2167, 126.3333
            <br />
            • DMS: 7°15'20.4"N, 126°20'36.5"E
          </p>
          
          {coordinates.map((coord, index) => (
            <div key={index} style={coordinateRowStyle}>
              <div style={coordinateInputStyle}>
                <div style={pointTitleStyle}>Point {index + 1}</div>
                <div style={coordinateFieldsStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontSize: 11 }}>Latitude</label>
                    <input
                      style={inputStyle}
                      type="text"
                      value={coord.lat}
                      onChange={e => updateCoordinate(index, 'lat', e.target.value)}
                      placeholder=" "
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontSize: 11 }}>Longitude</label>
                    <input
                      style={inputStyle}
                      type="text"
                      value={coord.lng}
                      onChange={e => updateCoordinate(index, 'lng', e.target.value)}
                      placeholder=" "
                    />
                  </div>
                </div>
              </div>
              {coordinates.length > 3 && (
                <button
                  type="button"
                  style={removeButtonStyle}
                  onClick={() => removeCoordinate(index)}
                  title="Remove coordinate"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <button type="button" style={addButtonStyle} onClick={addCoordinate}>
            + Add Coordinate Point
          </button>
          
          {errors.coordinates && <div style={{ color: '#c00', fontSize: 12, marginTop: 8 }}>{errors.coordinates}</div>}
        </div>

        {/* Action Buttons */}
        <div style={buttonRowStyle}>
          <button type="button" style={cancelBtnStyle} onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button 
            type="submit" 
            style={{ 
              ...saveBtnStyle, 
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }} 
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Plot'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditFarmPlotModal;
